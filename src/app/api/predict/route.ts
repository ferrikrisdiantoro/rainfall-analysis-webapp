import { NextRequest, NextResponse } from 'next/server';
import {
    ModelType,
    MODEL_REGISTRY,
    recursiveForecast,
    getModelInfo,
    getAvailableModels,
} from '@/lib/onnxLoader';

// Types for API response
interface PredictionResponse {
    success: true;
    model: {
        type: ModelType;
        name: string;
        mae: number;
        rmse: number;
    };
    horizon: number;
    predictions: {
        date: string;
        value: number;
    }[];
    historicalSummary: {
        count: number;
        startDate: string;
        endDate: string;
    };
}

interface ErrorResponse {
    success: false;
    error: string;
    details?: string;
}

/**
 * POST /api/predict
 * 
 * Request body:
 * {
 *   "model": "gbr" | "lstm" | "bilstm",
 *   "horizon": 1-30,
 *   "historicalData": [{ "date": "YYYY-MM-DD", "value": number }, ...]
 * }
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<PredictionResponse | ErrorResponse>> {
    try {
        const body = await request.json();

        // Validate request body
        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                { success: false, error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const { model, horizon, historicalData } = body;

        // Validate model type
        const validModels: ModelType[] = ['gbr', 'lstm', 'bilstm'];
        if (!model || !validModels.includes(model)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid model type',
                    details: `Valid models: ${validModels.join(', ')}`,
                },
                { status: 400 }
            );
        }

        // Validate horizon
        const horizonNum = Number(horizon);
        if (isNaN(horizonNum) || horizonNum < 1 || horizonNum > 30) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid horizon',
                    details: 'Horizon must be between 1 and 30 days',
                },
                { status: 400 }
            );
        }

        // Validate historical data
        if (!Array.isArray(historicalData) || historicalData.length < 7) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Insufficient historical data',
                    details: 'At least 7 data points are required',
                },
                { status: 400 }
            );
        }

        // Validate each data point
        for (let i = 0; i < historicalData.length; i++) {
            const point = historicalData[i];
            if (!point.date || typeof point.value !== 'number') {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Invalid data point at index ${i}`,
                        details: 'Each point must have "date" (string) and "value" (number)',
                    },
                    { status: 400 }
                );
            }
        }

        // Run recursive forecasting
        const predictions = await recursiveForecast(
            model as ModelType,
            historicalData,
            horizonNum
        );

        // Get model info
        const modelInfo = getModelInfo(model as ModelType);

        // Sort historical data to get summary
        const sortedHistorical = [...historicalData].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return NextResponse.json({
            success: true,
            model: {
                type: model as ModelType,
                name: modelInfo.displayName,
                mae: modelInfo.mae,
                rmse: modelInfo.rmse,
            },
            horizon: horizonNum,
            predictions: predictions.map(p => ({
                date: p.date,
                value: Math.round(p.value * 100) / 100, // Round to 2 decimals
            })),
            historicalSummary: {
                count: historicalData.length,
                startDate: sortedHistorical[0].date,
                endDate: sortedHistorical[sortedHistorical.length - 1].date,
            },
        });

    } catch (error) {
        console.error('[API/predict] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Prediction failed',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/predict
 * Returns API documentation and available models
 */
export async function GET(): Promise<NextResponse> {
    const models = getAvailableModels();

    return NextResponse.json({
        endpoint: '/api/predict',
        method: 'POST',
        description: 'Time-series rainfall prediction using ONNX ML models',
        availableModels: models.map(m => ({
            type: m.type,
            name: m.info.displayName,
            description: m.info.description,
            mae: m.info.mae,
            rmse: m.info.rmse,
        })),
        request: {
            model: 'Model type: "gbr" | "lstm" | "bilstm"',
            horizon: 'Prediction horizon: 1-30 days',
            historicalData: 'Array of { date: "YYYY-MM-DD", value: number } (minimum 7 points)',
        },
        response: {
            success: 'boolean',
            model: 'Selected model information with MAE/RMSE metrics',
            horizon: 'Number of days predicted',
            predictions: 'Array of { date, value } for each predicted day',
        },
    });
}
