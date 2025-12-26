import { NextRequest, NextResponse } from 'next/server';
import { runInference } from '@/lib/onnxLoader';
import { PredictionResult, ApiError } from '@/types';

/**
 * POST /api/predict
 * 
 * Runs ONNX inference for time-series prediction using lag features.
 * 
 * Request body:
 * {
 *   "features": [lag_1, lag_2, lag_3, lag_4, lag_5, lag_6, lag_7]
 * }
 * 
 * Response:
 * {
 *   "prediction": number,
 *   "features": number[]
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<PredictionResult | ApiError>> {
    try {
        const body = await request.json();

        // Validate request body
        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const { features } = body;

        // Validate features array
        if (!Array.isArray(features)) {
            return NextResponse.json(
                { error: 'Features must be an array' },
                { status: 400 }
            );
        }

        if (features.length !== 7) {
            return NextResponse.json(
                { error: 'Features must contain exactly 7 values (lag_1 through lag_7)' },
                { status: 400 }
            );
        }

        // Validate all features are numbers
        for (let i = 0; i < features.length; i++) {
            const val = features[i];
            if (typeof val !== 'number' || isNaN(val)) {
                return NextResponse.json(
                    { error: `Feature at index ${i} is not a valid number`, details: `Value: ${val}` },
                    { status: 400 }
                );
            }
        }

        // Run inference
        const prediction = await runInference(features);

        return NextResponse.json({
            prediction,
            features
        });

    } catch (error) {
        console.error('Prediction error:', error);
        return NextResponse.json(
            {
                error: 'Prediction failed',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/predict
 * Returns information about the prediction endpoint
 */
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        endpoint: '/api/predict',
        method: 'POST',
        description: 'Time-series prediction using ONNX model with lag features',
        request: {
            features: '[lag_1, lag_2, lag_3, lag_4, lag_5, lag_6, lag_7] - Array of 7 numerical values'
        },
        response: {
            prediction: 'Predicted value for the next time step',
            features: 'Echo of input features'
        }
    });
}
