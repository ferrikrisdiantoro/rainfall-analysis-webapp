/**
 * ONNX Web Inference - Browser-side ML inference
 * 
 * Uses onnxruntime-web for inference that works in browser (Vercel compatible)
 */

import * as ort from 'onnxruntime-web';

// Model types
export type ModelType = 'gbr' | 'lstm' | 'bilstm';

// Model metadata
interface ModelInfo {
    name: string;
    displayName: string;
    inputShape: number[];
    description: string;
    mae: number;
    rmse: number;
    path: string;
}

// Model registry
export const MODEL_REGISTRY: Record<ModelType, ModelInfo> = {
    gbr: {
        name: 'model_gbr.onnx',
        displayName: 'Gradient Boosting Regressor',
        inputShape: [1, 9],
        description: 'Tabular ML model with engineered features (lag, rolling stats, month)',
        mae: 6.42,
        rmse: 11.28,
        path: '/models/model_gbr.onnx',
    },
    lstm: {
        name: 'model_lstm.onnx',
        displayName: 'LSTM (Long Short-Term Memory)',
        inputShape: [1, 7, 1],
        description: 'Deep learning sequence model for time-series prediction',
        mae: 7.15,
        rmse: 12.03,
        path: '/models/model_lstm.onnx',
    },
    bilstm: {
        name: 'model_bilstm.onnx',
        displayName: 'Bidirectional LSTM',
        inputShape: [1, 7, 1],
        description: 'Bidirectional deep learning model for enhanced sequence modeling',
        mae: 6.89,
        rmse: 11.67,
        path: '/models/model_bilstm.onnx',
    },
};

// Session cache for singleton pattern
const sessionCache: Map<ModelType, ort.InferenceSession> = new Map();

/**
 * Configure ONNX Runtime Web
 */
function configureOrt() {
    // Use WASM backend (most compatible)
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = true;
}

/**
 * Load ONNX model session
 */
export async function loadModel(modelType: ModelType): Promise<ort.InferenceSession> {
    // Return cached session if exists
    if (sessionCache.has(modelType)) {
        return sessionCache.get(modelType)!;
    }

    const modelInfo = MODEL_REGISTRY[modelType];
    if (!modelInfo) {
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

        // Cache the session
        sessionCache.set(modelType, session);

        return session;
    } catch (error) {
        console.error(`[ONNX-Web] Failed to load model ${modelType}:`, error);
        throw new Error(`Failed to load model: ${error}`);
    }
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

    // Calculate standard deviation
    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / windowSize;
    const std = Math.sqrt(variance);

    return { mean, max, std };
}

/**
 * Prepare GBR features - 9 features total
 * Order: [lag_1, lag_3, lag_7, roll_mean_3, roll_mean_7, roll_max_7, roll_std_7, bulan_idx, day_of_week]
 */
export function prepareGBRFeatures(historicalValues: number[], targetDate: Date): number[] {
    if (historicalValues.length < 7) {
        throw new Error('GBR model requires at least 7 historical data points');
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
    const bulan_idx = targetDate.getMonth() + 1; // 1-12
    // Python dayofweek: Monday=0, Sunday=6
    // JS getDay(): Sunday=0, Saturday=6
    // Convert JS to Python: (getDay() + 6) % 7
    const day_of_week = (targetDate.getDay() + 6) % 7; // Monday=0, Sunday=6

    // Return 9 features in STRICT ORDER matching training
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
 * Prepare LSTM features
 */
export function prepareLSTMFeatures(historicalValues: number[]): number[] {
    if (historicalValues.length < 7) {
        throw new Error('LSTM model requires at least 7 historical data points');
    }
    return historicalValues.slice(-7);
}

/**
 * Run inference on model
 */
export async function runInference(
    modelType: ModelType,
    features: number[]
): Promise<number> {
    const session = await loadModel(modelType);

    let inputTensor: ort.Tensor;

    if (modelType === 'gbr') {
        if (features.length !== 9) {
            throw new Error(`GBR expects 9 features, got ${features.length}`);
        }
        inputTensor = new ort.Tensor('float32', new Float32Array(features), [1, 9]);
    } else {
        if (features.length !== 7) {
            throw new Error(`LSTM expects 7 values, got ${features.length}`);
        }
        inputTensor = new ort.Tensor('float32', new Float32Array(features), [1, 7, 1]);
    }

    const inputName = session.inputNames[0];
    const feeds: Record<string, ort.Tensor> = { [inputName]: inputTensor };

    const results = await session.run(feeds);

    const outputName = session.outputNames[0];
    const output = results[outputName];
    const prediction = (output.data as Float32Array)[0];

    return Math.max(0, prediction);
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

        let features: number[];
        if (modelType === 'gbr') {
            features = prepareGBRFeatures(workingValues, targetDate);
        } else {
            features = prepareLSTMFeatures(workingValues);
        }

        const prediction = await runInference(modelType, features);

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
