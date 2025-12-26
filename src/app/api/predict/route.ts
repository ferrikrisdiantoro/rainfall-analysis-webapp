import { NextRequest, NextResponse } from 'next/server';
import { PredictionResult, ApiError } from '@/types';

/**
 * Simple prediction using weighted moving average and trend analysis.
 * This is a fallback for when ONNX runtime is not available (e.g., Vercel).
 */
function simplePrediction(features: number[]): number {
    // features = [lag_1, lag_2, lag_3, lag_4, lag_5, lag_6, lag_7]
    // lag_1 is most recent, lag_7 is oldest

    // Weighted moving average (more weight on recent values)
    const weights = [0.30, 0.25, 0.18, 0.12, 0.08, 0.05, 0.02];
    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < features.length; i++) {
        weightedSum += features[i] * weights[i];
        totalWeight += weights[i];
    }

    const movingAvg = weightedSum / totalWeight;

    // Simple trend: compare recent vs older average
    const recentAvg = (features[0] + features[1] + features[2]) / 3;
    const olderAvg = (features[4] + features[5] + features[6]) / 3;
    const trend = recentAvg - olderAvg;

    // Combine moving average with slight trend adjustment
    let prediction = movingAvg + (trend * 0.1);

    // Add small random variation for realism
    const variation = (Math.random() - 0.5) * 2; // -1 to 1
    prediction += variation;

    // Ensure non-negative
    return Math.max(0, prediction);
}

/**
 * POST /api/predict
 * 
 * Runs prediction for time-series using lag features.
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

        // Preprocess: negative values become 0
        const processedFeatures = features.map((v: number) => Math.max(0, v));

        // Run simple prediction (fallback for Vercel compatibility)
        const prediction = simplePrediction(processedFeatures);

        return NextResponse.json({
            prediction,
            features: processedFeatures
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
        description: 'Time-series rainfall prediction using weighted moving average with trend analysis',
        request: {
            features: '[lag_1, lag_2, lag_3, lag_4, lag_5, lag_6, lag_7] - Array of 7 numerical values (most recent to oldest)'
        },
        response: {
            prediction: 'Predicted rainfall value for the next time step',
            features: 'Processed input features'
        },
        note: 'This is a simplified prediction model for demonstration. For production, consider using ONNX Runtime on a server that supports native modules.'
    });
}
