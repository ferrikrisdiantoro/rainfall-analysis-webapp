/**
 * ONNX Web Inference - Browser-side ML inference
 * 
 * Uses onnxruntime-web for inference that works in browser (Vercel compatible)
 * Includes normalization (StandardScaler) for improved prediction accuracy
 */

import * as ort from 'onnxruntime-web';

// Model types
export type ModelType = 'gbr' | 'xgb' | 'lstm' | 'bilstm' | 'hybrid';

// Model metadata
interface ModelInfo {
    name: string;
    displayName: string;
    inputShape: number[];
    description: string;
    mae: number;
    rmse: number;
    path: string;
    usesFeatureScaler?: boolean;  // For tabular models (GBR, XGB)
    usesTargetScaler?: boolean;   // For sequence models (LSTM, BiLSTM)
}

// Scaler parameters (from training)
interface ScalerParams {
    feature_scaler: {
        mean: number[];
        scale: number[];
    };
    target_scaler: {
        mean: number;
        scale: number;
    };
}

// Hardcoded scaler parameters from training
const SCALER_PARAMS: ScalerParams = {
    feature_scaler: {
        mean: [
            1.5034776847977684,
            1.5047677824267782,
            1.5121806136680611,
            1.5027935068960179,
            1.505339277412499,
            2.3536510925151095,
            0.5868997351841349,
            8.01673640167364,
            2.999302649930265
        ],
        scale: [
            1.7453128483566687,
            1.7474087481923781,
            1.7581850927128913,
            1.6589804600670142,
            1.5471533588843935,
            2.2020681136274662,
            0.65485208217006,
            2.938656692514004,
            2.0012198690276453
        ]
    },
    target_scaler: {
        mean: 1.4091728960584102,
        scale: 1.7061216300633373
    }
};

// Model registry
export const MODEL_REGISTRY: Record<ModelType, ModelInfo> = {
    gbr: {
        name: 'model_gbr.onnx',
        displayName: 'Gradient Boosting Regressor',
        inputShape: [1, 9],
        description: 'Tabular ML model with engineered features (lag, rolling stats, month)',
        mae: 0.29,
        rmse: 0.54,
        path: '/models/model_gbr.onnx',
        usesFeatureScaler: true,
    },
    xgb: {
        name: 'model_xgb.onnx',
        displayName: 'XGBoost Regressor',
        inputShape: [1, 9],
        description: 'Extreme Gradient Boosting model for accurate predictions',
        mae: 0.31,
        rmse: 0.53,
        path: '/models/model_xgb.onnx',
        usesFeatureScaler: true,
    },
    lstm: {
        name: 'model_lstm.onnx',
        displayName: 'LSTM (Long Short-Term Memory)',
        inputShape: [1, 7, 1],
        description: 'Deep learning sequence model for time-series prediction',
        mae: 0.46,
        rmse: 0.77,
        path: '/models/model_lstm.onnx',
        usesTargetScaler: true,
    },
    bilstm: {
        name: 'model_bilstm.onnx',
        displayName: 'Bidirectional LSTM',
        inputShape: [1, 7, 1],
        description: 'Bidirectional deep learning model for enhanced sequence modeling',
        mae: 0.69,
        rmse: 1.05,
        path: '/models/model_bilstm.onnx',
        usesTargetScaler: true,
    },
    hybrid: {
        name: 'hybrid',
        displayName: 'Hybrid XGBoost + LSTM',
        inputShape: [1, 9],
        description: 'Ensemble model combining XGBoost and LSTM predictions',
        mae: 0.35,
        rmse: 0.60,
        path: '',  // Uses both xgb and lstm
        usesFeatureScaler: true,
        usesTargetScaler: true,
    },
};

// Session cache disabled to avoid "Session already started" error
// const sessionCache: Map<string, ort.InferenceSession> = new Map();

/**
 * Configure ONNX Runtime Web
 */
function configureOrt() {
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = true;
}

/**
 * Load ONNX model session (creates fresh session each time)
 */
export async function loadModel(modelType: Exclude<ModelType, 'hybrid'>): Promise<ort.InferenceSession> {
    const modelInfo = MODEL_REGISTRY[modelType];
    if (!modelInfo || !modelInfo.path) {
        throw new Error(`Unknown model type: ${modelType}`);
    }

    configureOrt();

    try {
        console.log(`[ONNX-Web] Loading model: ${modelInfo.displayName}`);

        const session = await ort.InferenceSession.create(modelInfo.path, {
            executionProviders: ['wasm'],
        });

        console.log(`[ONNX-Web] Model loaded successfully`);
        console.log(`[ONNX-Web] Input names: ${session.inputNames}`);
        console.log(`[ONNX-Web] Output names: ${session.outputNames}`);

        return session;
    } catch (error) {
        console.error(`[ONNX-Web] Failed to load model ${modelType}:`, error);
        throw new Error(`Failed to load model: ${error}`);
    }
}

/**
 * Apply StandardScaler transform to features
 */
function scaleFeatures(features: number[]): number[] {
    const { mean, scale } = SCALER_PARAMS.feature_scaler;
    return features.map((val, idx) => (val - mean[idx]) / scale[idx]);
}

/**
 * Apply StandardScaler transform to target (for LSTM input)
 */
function scaleTarget(value: number): number {
    const { mean, scale } = SCALER_PARAMS.target_scaler;
    return (value - mean) / scale;
}

/**
 * Apply inverse StandardScaler transform to prediction (for LSTM output)
 */
function inverseScaleTarget(scaledValue: number): number {
    const { mean, scale } = SCALER_PARAMS.target_scaler;
    return scaledValue * scale + mean;
}

/**
 * Calculate rolling statistics
 */
function calculateRollingStats(values: number[], windowSize: number): { mean: number; max: number; std: number } {
    if (values.length < windowSize) {
        const padded = [...Array(windowSize - values.length).fill(values[0] || 0), ...values];
        values = padded;
    }

    const window = values.slice(-windowSize);
    const mean = window.reduce((a, b) => a + b, 0) / windowSize;
    const max = Math.max(...window);

    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / windowSize;
    const std = Math.sqrt(variance);

    return { mean, max, std };
}

/**
 * Prepare GBR/XGB features - 9 features total (UNSCALED)
 * Order: [lag_1, lag_3, lag_7, roll_mean_3, roll_mean_7, roll_max_7, roll_std_7, bulan_idx, day_of_week]
 */
export function prepareTabularFeatures(historicalValues: number[], targetDate: Date): number[] {
    if (historicalValues.length < 7) {
        throw new Error('Tabular model requires at least 7 historical data points');
    }

    const values = historicalValues.slice(-7);

    // Lag features
    const lag_1 = values[values.length - 1];
    const lag_3 = values[values.length - 3] ?? values[0];
    const lag_7 = values[0];

    // Rolling statistics
    const roll3 = calculateRollingStats(values, 3);
    const roll7 = calculateRollingStats(values, 7);

    // Time features
    const bulan_idx = targetDate.getMonth() + 1;
    const day_of_week = (targetDate.getDay() + 6) % 7;

    return [
        lag_1,
        lag_3,
        lag_7,
        roll3.mean,
        roll7.mean,
        roll7.max,
        roll7.std,
        bulan_idx,
        day_of_week
    ];
}

/**
 * Prepare LSTM features (SCALED)
 */
export function prepareLSTMFeatures(historicalValues: number[]): number[] {
    if (historicalValues.length < 7) {
        throw new Error('LSTM model requires at least 7 historical data points');
    }
    // Scale each value using target scaler
    return historicalValues.slice(-7).map(v => scaleTarget(v));
}

// Legacy alias for backward compatibility
export function prepareGBRFeatures(historicalValues: number[], targetDate: Date): number[] {
    return prepareTabularFeatures(historicalValues, targetDate);
}

/**
 * Run inference on tabular model (GBR, XGB)
 */
async function runTabularInference(
    modelType: 'gbr' | 'xgb',
    features: number[]
): Promise<number> {
    const session = await loadModel(modelType);

    if (features.length !== 9) {
        throw new Error(`Tabular model expects 9 features, got ${features.length}`);
    }

    // Apply feature scaling
    const scaledFeatures = scaleFeatures(features);
    const inputTensor = new ort.Tensor('float32', new Float32Array(scaledFeatures), [1, 9]);

    const inputName = session.inputNames[0];
    const feeds: Record<string, ort.Tensor> = { [inputName]: inputTensor };

    const results = await session.run(feeds);

    const outputName = session.outputNames[0];
    const output = results[outputName];
    const prediction = (output.data as Float32Array)[0];

    // No inverse transform needed - tabular models predict in original scale
    return Math.max(0, prediction);
}

/**
 * Run inference on sequence model (LSTM, BiLSTM)
 */
async function runSequenceInference(
    modelType: 'lstm' | 'bilstm',
    features: number[]  // Already scaled
): Promise<number> {
    const session = await loadModel(modelType);

    if (features.length !== 7) {
        throw new Error(`Sequence model expects 7 values, got ${features.length}`);
    }

    const inputTensor = new ort.Tensor('float32', new Float32Array(features), [1, 7, 1]);

    const inputName = session.inputNames[0];
    const feeds: Record<string, ort.Tensor> = { [inputName]: inputTensor };

    const results = await session.run(feeds);

    const outputName = session.outputNames[0];
    const output = results[outputName];
    const scaledPrediction = (output.data as Float32Array)[0];

    // Apply inverse transform to get original scale
    const prediction = inverseScaleTarget(scaledPrediction);
    return Math.max(0, prediction);
}

/**
 * Run inference on model
 */
export async function runInference(
    modelType: ModelType,
    features: number[]
): Promise<number> {
    if (modelType === 'gbr' || modelType === 'xgb') {
        return runTabularInference(modelType, features);
    } else if (modelType === 'lstm' || modelType === 'bilstm') {
        return runSequenceInference(modelType, features);
    } else if (modelType === 'hybrid') {
        throw new Error('Use runHybridInference for hybrid model');
    }
    throw new Error(`Unknown model type: ${modelType}`);
}

/**
 * Run hybrid XGBoost + LSTM inference
 * Combines predictions from both models with weighted average
 * Note: Run sequentially to avoid ONNX session conflict in browser
 */
export async function runHybridInference(
    tabularFeatures: number[],   // 9 features for XGB
    sequenceFeatures: number[],  // 7 scaled values for LSTM
    xgbWeight: number = 0.6      // Weight for XGBoost (default 60%)
): Promise<number> {
    // Run sequentially to avoid "Session already started" error
    const xgbPred = await runTabularInference('xgb', tabularFeatures);
    const lstmPred = await runSequenceInference('lstm', sequenceFeatures);

    // Weighted average
    const hybridPred = xgbWeight * xgbPred + (1 - xgbWeight) * lstmPred;
    return Math.max(0, hybridPred);
}

/**
 * Recursive forecast for multiple days
 */
export async function forecast(
    modelType: ModelType,
    historicalData: { date: string; value: number }[],
    horizonDays: number,
    onProgress?: (day: number, total: number) => void
): Promise<{ date: string; value: number }[]> {
    if (horizonDays < 1 || horizonDays > 30) {
        throw new Error('Horizon must be between 1 and 30 days');
    }

    const sortedData = [...historicalData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const values = sortedData.map(d => Math.max(0, d.value));

    if (values.length < 7) {
        throw new Error('At least 7 historical data points are required');
    }

    const lastDate = new Date(sortedData[sortedData.length - 1].date);
    const predictions: { date: string; value: number }[] = [];
    const workingValues = [...values];

    for (let day = 1; day <= horizonDays; day++) {
        const targetDate = new Date(lastDate);
        targetDate.setDate(targetDate.getDate() + day);

        let prediction: number;

        if (modelType === 'gbr' || modelType === 'xgb') {
            const features = prepareTabularFeatures(workingValues, targetDate);
            prediction = await runTabularInference(modelType, features);
        } else if (modelType === 'lstm' || modelType === 'bilstm') {
            const features = prepareLSTMFeatures(workingValues);
            prediction = await runSequenceInference(modelType, features);
        } else if (modelType === 'hybrid') {
            const tabularFeatures = prepareTabularFeatures(workingValues, targetDate);
            const sequenceFeatures = prepareLSTMFeatures(workingValues);
            prediction = await runHybridInference(tabularFeatures, sequenceFeatures);
        } else {
            throw new Error(`Unknown model type: ${modelType}`);
        }

        predictions.push({
            date: targetDate.toISOString().split('T')[0],
            value: Math.round(prediction * 100) / 100,
        });

        workingValues.push(prediction);

        if (onProgress) {
            onProgress(day, horizonDays);
        }
    }

    return predictions;
}

/**
 * Get model info
 */
export function getModelInfo(modelType: ModelType): ModelInfo {
    return MODEL_REGISTRY[modelType];
}

/**
 * Get all available models
 */
export function getAvailableModels(): { type: ModelType; info: ModelInfo }[] {
    return Object.entries(MODEL_REGISTRY).map(([type, info]) => ({
        type: type as ModelType,
        info,
    }));
}

/**
 * Get scaler parameters (for debugging/testing)
 */
export function getScalerParams(): ScalerParams {
    return SCALER_PARAMS;
}
