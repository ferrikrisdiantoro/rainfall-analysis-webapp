import * as ort from 'onnxruntime-node';
import path from 'path';
import fs from 'fs';

// Model types supported by the system
export type ModelType = 'gbr' | 'lstm' | 'bilstm';

// Model metadata
interface ModelInfo {
    name: string;
    displayName: string;
    inputShape: number[];
    description: string;
    mae: number;
    rmse: number;
}

// Model registry with metadata
export const MODEL_REGISTRY: Record<ModelType, ModelInfo> = {
    gbr: {
        name: 'model_gbr.onnx',
        displayName: 'Gradient Boosting Regressor',
        inputShape: [1, 7],
        description: 'Tabular ML model with engineered features (lag, rolling stats, month)',
        mae: 6.42,
        rmse: 11.28,
    },
    lstm: {
        name: 'model_lstm.onnx',
        displayName: 'LSTM (Long Short-Term Memory)',
        inputShape: [1, 7, 1],
        description: 'Deep learning sequence model for time-series prediction',
        mae: 7.15,
        rmse: 12.03,
    },
    bilstm: {
        name: 'model_bilstm.onnx',
        displayName: 'Bidirectional LSTM',
        inputShape: [1, 7, 1],
        description: 'Bidirectional deep learning model for enhanced sequence modeling',
        mae: 6.89,
        rmse: 11.67,
    },
};

// Singleton session cache
const sessionCache: Map<ModelType, ort.InferenceSession> = new Map();

/**
 * Get or create ONNX inference session for a specific model (singleton pattern).
 */
export async function getOnnxSession(modelType: ModelType): Promise<ort.InferenceSession> {
    // Return cached session if exists
    if (sessionCache.has(modelType)) {
        return sessionCache.get(modelType)!;
    }

    const modelInfo = MODEL_REGISTRY[modelType];
    if (!modelInfo) {
        throw new Error(`Unknown model type: ${modelType}`);
    }

    const modelPath = path.join(process.cwd(), 'public', 'models', modelInfo.name);

    // Check if model file exists
    if (!fs.existsSync(modelPath)) {
        throw new Error(`Model file not found: ${modelPath}`);
    }

    try {
        const session = await ort.InferenceSession.create(modelPath, {
            executionProviders: ['cpu'],
        });

        console.log(`[ONNX] Loaded model: ${modelInfo.displayName}`);
        console.log(`[ONNX] Input names: ${session.inputNames}`);
        console.log(`[ONNX] Output names: ${session.outputNames}`);

        // Cache the session
        sessionCache.set(modelType, session);

        return session;
    } catch (error) {
        console.error(`[ONNX] Failed to load model ${modelType}:`, error);
        throw new Error(`Failed to load ONNX model: ${error}`);
    }
}

/**
 * Calculate rolling statistics from historical data.
 */
function calculateRollingStats(values: number[], windowSize: number): { mean: number; max: number } {
    if (values.length < windowSize) {
        // Pad with the first value if not enough data
        const padded = [...Array(windowSize - values.length).fill(values[0] || 0), ...values];
        values = padded;
    }

    const window = values.slice(-windowSize);
    const mean = window.reduce((a, b) => a + b, 0) / windowSize;
    const max = Math.max(...window);

    return { mean, max };
}

/**
 * Prepare GBR features from historical data.
 * Features: [lag_1, lag_3, lag_7, roll_mean_3, roll_mean_7, roll_max_7, bulan_idx]
 */
export function prepareGBRFeatures(
    historicalValues: number[],
    targetDate: Date
): number[] {
    // Ensure we have at least 7 values
    if (historicalValues.length < 7) {
        throw new Error('GBR model requires at least 7 historical data points');
    }

    // Get the last 7 values for feature calculation
    const values = historicalValues.slice(-7);

    // Lag features (1-indexed from the end)
    const lag_1 = values[values.length - 1]; // Most recent
    const lag_3 = values[values.length - 3] ?? values[0];
    const lag_7 = values[0]; // Oldest of the 7

    // Rolling statistics
    const roll3 = calculateRollingStats(values, 3);
    const roll7 = calculateRollingStats(values, 7);

    // Month index (0-11)
    const bulan_idx = targetDate.getMonth();

    // Return features in STRICT ORDER
    return [
        lag_1,
        lag_3,
        lag_7,
        roll3.mean,
        roll7.mean,
        roll7.max,
        bulan_idx,
    ];
}

/**
 * Prepare LSTM/BiLSTM features from historical data.
 * Input shape: [1, 7, 1] - sequence of 7 values
 */
export function prepareLSTMFeatures(historicalValues: number[]): number[] {
    if (historicalValues.length < 7) {
        throw new Error('LSTM model requires at least 7 historical data points');
    }

    // Return the last 7 values
    return historicalValues.slice(-7);
}

/**
 * Run inference on a specific ONNX model.
 */
export async function runModelInference(
    modelType: ModelType,
    features: number[]
): Promise<number> {
    const session = await getOnnxSession(modelType);
    const modelInfo = MODEL_REGISTRY[modelType];

    let inputTensor: ort.Tensor;

    if (modelType === 'gbr') {
        // GBR: shape [1, 7]
        if (features.length !== 7) {
            throw new Error(`GBR model expects 7 features, got ${features.length}`);
        }
        inputTensor = new ort.Tensor(
            'float32',
            new Float32Array(features),
            [1, 7]
        );
    } else {
        // LSTM/BiLSTM: shape [1, 7, 1]
        if (features.length !== 7) {
            throw new Error(`${modelType.toUpperCase()} model expects 7 sequence values, got ${features.length}`);
        }
        inputTensor = new ort.Tensor(
            'float32',
            new Float32Array(features),
            [1, 7, 1]
        );
    }

    // Get input name from model
    const inputName = session.inputNames[0];

    // Run inference
    const feeds: Record<string, ort.Tensor> = {};
    feeds[inputName] = inputTensor;

    const results = await session.run(feeds);

    // Get output
    const outputName = session.outputNames[0];
    const output = results[outputName];

    // Extract prediction value
    const prediction = (output.data as Float32Array)[0];

    // Ensure non-negative (rainfall can't be negative)
    return Math.max(0, prediction);
}

/**
 * Perform recursive forecasting for multiple days ahead.
 */
export async function recursiveForecast(
    modelType: ModelType,
    historicalData: { date: string; value: number }[],
    horizonDays: number
): Promise<{ date: string; value: number; isActual: boolean }[]> {
    if (horizonDays < 1 || horizonDays > 30) {
        throw new Error('Horizon must be between 1 and 30 days');
    }

    // Sort historical data by date
    const sortedData = [...historicalData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get values array
    const values = sortedData.map(d => Math.max(0, d.value)); // Ensure non-negative

    if (values.length < 7) {
        throw new Error('At least 7 historical data points are required');
    }

    // Start forecasting from the day after the last historical date
    const lastDate = new Date(sortedData[sortedData.length - 1].date);

    const predictions: { date: string; value: number; isActual: boolean }[] = [];
    const workingValues = [...values]; // Copy for recursive updates

    for (let day = 1; day <= horizonDays; day++) {
        // Calculate target date
        const targetDate = new Date(lastDate);
        targetDate.setDate(targetDate.getDate() + day);

        let prediction: number;

        if (modelType === 'gbr') {
            // Prepare GBR features
            const features = prepareGBRFeatures(workingValues, targetDate);
            prediction = await runModelInference(modelType, features);
        } else {
            // Prepare LSTM/BiLSTM features
            const features = prepareLSTMFeatures(workingValues);
            prediction = await runModelInference(modelType, features);
        }

        // Add prediction to results
        predictions.push({
            date: targetDate.toISOString().split('T')[0],
            value: prediction,
            isActual: false,
        });

        // Update working values for next iteration (recursive)
        workingValues.push(prediction);
    }

    return predictions;
}

/**
 * Get model information.
 */
export function getModelInfo(modelType: ModelType): ModelInfo {
    return MODEL_REGISTRY[modelType];
}

/**
 * Get all available models.
 */
export function getAvailableModels(): { type: ModelType; info: ModelInfo }[] {
    return Object.entries(MODEL_REGISTRY).map(([type, info]) => ({
        type: type as ModelType,
        info,
    }));
}
