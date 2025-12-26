import * as ort from 'onnxruntime-node';
import path from 'path';

let session: ort.InferenceSession | null = null;

/**
 * Get or create the ONNX inference session (singleton pattern).
 * The model is loaded once and reused for all subsequent requests.
 */
export async function getOnnxSession(): Promise<ort.InferenceSession> {
    if (session) {
        return session;
    }

    const modelPath = path.join(process.cwd(), 'public', 'models', 'model_hujan.onnx');

    try {
        session = await ort.InferenceSession.create(modelPath, {
            executionProviders: ['cpu'],
        });
        console.log('ONNX model loaded successfully');
        console.log('Input names:', session.inputNames);
        console.log('Output names:', session.outputNames);
        return session;
    } catch (error) {
        console.error('Failed to load ONNX model:', error);
        throw new Error(`Failed to load ONNX model: ${error}`);
    }
}

/**
 * Run inference on the ONNX model with the given lag features.
 * 
 * @param features Array of 7 lag features [lag_1, lag_2, ..., lag_7]
 * @returns Prediction value
 */
export async function runInference(features: number[]): Promise<number> {
    // Validate input
    if (!Array.isArray(features) || features.length !== 7) {
        throw new Error('Features must be an array of exactly 7 values');
    }

    // Validate all values are numbers
    for (let i = 0; i < features.length; i++) {
        if (typeof features[i] !== 'number' || isNaN(features[i])) {
            throw new Error(`Feature at index ${i} is not a valid number`);
        }
    }

    // Preprocess: negative values become 0
    const processedFeatures = features.map(v => Math.max(0, v));

    const session = await getOnnxSession();

    // Create input tensor - shape [1, 7] for batch size 1
    const inputTensor = new ort.Tensor(
        'float32',
        new Float32Array(processedFeatures),
        [1, 7]
    );

    // Get the input name from the model
    const inputName = session.inputNames[0];

    // Run inference
    const feeds: Record<string, ort.Tensor> = {};
    feeds[inputName] = inputTensor;

    const results = await session.run(feeds);

    // Get the output
    const outputName = session.outputNames[0];
    const output = results[outputName];

    // Extract the prediction value
    const prediction = (output.data as Float32Array)[0];

    // Return prediction (ensure non-negative)
    return Math.max(0, prediction);
}
