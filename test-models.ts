/**
 * Terminal Test Script for ONNX Models
 * Run: npx tsx test-models.ts
 */

import * as ort from 'onnxruntime-node';
import * as fs from 'fs';
import * as path from 'path';

// Scaler parameters from training
const SCALER_PARAMS = {
    feature_scaler: {
        mean: [1.5034776847977684, 1.5047677824267782, 1.5121806136680611, 1.5027935068960179, 1.505339277412499, 2.3536510925151095, 0.5868997351841349, 8.01673640167364, 2.999302649930265],
        scale: [1.7453128483566687, 1.7474087481923781, 1.7581850927128913, 1.6589804600670142, 1.5471533588843935, 2.2020681136274662, 0.65485208217006, 2.938656692514004, 2.0012198690276453]
    },
    target_scaler: {
        mean: 1.4091728960584102,
        scale: 1.7061216300633373
    }
};

// Sample historical data (30 days)
const SAMPLE_DATA = [
    0.5, 1.2, 2.8, 1.6, 0.3, 0.0, 0.8, 1.5, 2.3, 0.9,
    0.2, 0.0, 0.5, 1.8, 3.2, 2.1, 1.4, 0.7, 0.1, 0.0,
    0.6, 1.9, 2.5, 1.3, 0.8, 0.4, 0.0, 0.3, 1.1, 1.7
];

function scaleFeatures(features: number[]): number[] {
    const { mean, scale } = SCALER_PARAMS.feature_scaler;
    return features.map((val, idx) => (val - mean[idx]) / scale[idx]);
}

function scaleTarget(value: number): number {
    const { mean, scale } = SCALER_PARAMS.target_scaler;
    return (value - mean) / scale;
}

function inverseScaleTarget(scaledValue: number): number {
    const { mean, scale } = SCALER_PARAMS.target_scaler;
    return scaledValue * scale + mean;
}

function calculateRollingStats(values: number[], windowSize: number) {
    const window = values.slice(-windowSize);
    const mean = window.reduce((a, b) => a + b, 0) / windowSize;
    const max = Math.max(...window);
    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / windowSize;
    const std = Math.sqrt(variance);
    return { mean, max, std };
}

function prepareTabularFeatures(values: number[]): number[] {
    const last7 = values.slice(-7);
    const lag_1 = last7[last7.length - 1];
    const lag_3 = last7[last7.length - 3];
    const lag_7 = last7[0];
    const roll3 = calculateRollingStats(last7, 3);
    const roll7 = calculateRollingStats(last7, 7);
    const bulan_idx = 11; // November
    const day_of_week = 3; // Thursday

    return [lag_1, lag_3, lag_7, roll3.mean, roll7.mean, roll7.max, roll7.std, bulan_idx, day_of_week];
}

function prepareLSTMFeatures(values: number[]): number[] {
    return values.slice(-7).map(v => scaleTarget(v));
}

async function testModel(name: string, modelPath: string, isTabular: boolean) {
    console.log(`\n🔹 Testing ${name}...`);

    try {
        const fullPath = path.join(__dirname, 'public', 'models', modelPath);
        if (!fs.existsSync(fullPath)) {
            console.log(`   ❌ Model file not found: ${fullPath}`);
            return null;
        }

        const session = await ort.InferenceSession.create(fullPath);
        console.log(`   ✓ Model loaded`);
        console.log(`   Input: ${session.inputNames}, Output: ${session.outputNames}`);

        let inputTensor: ort.Tensor;

        if (isTabular) {
            const rawFeatures = prepareTabularFeatures(SAMPLE_DATA);
            const scaledFeatures = scaleFeatures(rawFeatures);
            console.log(`   Raw features: [${rawFeatures.map(f => f.toFixed(2)).join(', ')}]`);
            console.log(`   Scaled features: [${scaledFeatures.map(f => f.toFixed(2)).join(', ')}]`);
            inputTensor = new ort.Tensor('float32', new Float32Array(scaledFeatures), [1, 9]);
        } else {
            const scaledSeq = prepareLSTMFeatures(SAMPLE_DATA);
            console.log(`   Scaled sequence: [${scaledSeq.map(f => f.toFixed(2)).join(', ')}]`);
            inputTensor = new ort.Tensor('float32', new Float32Array(scaledSeq), [1, 7, 1]);
        }

        const feeds: Record<string, ort.Tensor> = { [session.inputNames[0]]: inputTensor };
        const results = await session.run(feeds);
        const rawOutput = (results[session.outputNames[0]].data as Float32Array)[0];

        let finalPrediction: number;
        if (isTabular) {
            finalPrediction = Math.max(0, rawOutput);
        } else {
            finalPrediction = Math.max(0, inverseScaleTarget(rawOutput));
        }

        console.log(`   Raw output: ${rawOutput.toFixed(4)}`);
        console.log(`   ✅ Prediction: ${finalPrediction.toFixed(2)} mm`);

        return finalPrediction;
    } catch (error) {
        console.log(`   ❌ Error: ${error}`);
        return null;
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('ONNX Model Terminal Test');
    console.log('='.repeat(60));
    console.log(`\nSample data (last 7 values): [${SAMPLE_DATA.slice(-7).join(', ')}]`);

    const gbrPred = await testModel('Gradient Boosting', 'model_gbr.onnx', true);
    const xgbPred = await testModel('XGBoost', 'model_xgb.onnx', true);
    const lstmPred = await testModel('LSTM', 'model_lstm.onnx', false);
    const bilstmPred = await testModel('BiLSTM', 'model_bilstm.onnx', false);

    // Hybrid test
    console.log('\n🔹 Testing Hybrid XGB+LSTM...');
    if (xgbPred !== null && lstmPred !== null) {
        const hybridPred = 0.6 * xgbPred + 0.4 * lstmPred;
        console.log(`   XGB (60%): ${xgbPred.toFixed(2)} × 0.6 = ${(xgbPred * 0.6).toFixed(2)}`);
        console.log(`   LSTM (40%): ${lstmPred.toFixed(2)} × 0.4 = ${(lstmPred * 0.4).toFixed(2)}`);
        console.log(`   ✅ Hybrid Prediction: ${hybridPred.toFixed(2)} mm`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log('='.repeat(60));
    console.log(`GBR:    ${gbrPred?.toFixed(2) ?? 'FAILED'} mm`);
    console.log(`XGB:    ${xgbPred?.toFixed(2) ?? 'FAILED'} mm`);
    console.log(`LSTM:   ${lstmPred?.toFixed(2) ?? 'FAILED'} mm`);
    console.log(`BiLSTM: ${bilstmPred?.toFixed(2) ?? 'FAILED'} mm`);
    if (xgbPred && lstmPred) {
        console.log(`Hybrid: ${(0.6 * xgbPred + 0.4 * lstmPred).toFixed(2)} mm`);
    }
}

main().catch(console.error);
