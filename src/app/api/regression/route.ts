import { NextRequest, NextResponse } from 'next/server';
import { performRegression } from '@/lib/regression';
import { DataPoint, RegressionResult, ApiError } from '@/types';

/**
 * POST /api/regression
 * 
 * Performs regression analysis on X-Y data points.
 * 
 * Request body:
 * {
 *   "data": [{ "x": number, "y": number }, ...],
 *   "type": "linear" | "polynomial" | "exponential",
 *   "degree": number (optional, for polynomial regression, default: 2)
 * }
 * 
 * Response:
 * {
 *   "type": string,
 *   "formula": string,
 *   "coefficients": number[],
 *   "r2": number,
 *   "mae": number,
 *   "rmse": number,
 *   "predictions": number[]
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<RegressionResult | ApiError>> {
    try {
        const body = await request.json();

        // Validate request body
        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const { data, type, degree } = body;

        // Validate data array
        if (!Array.isArray(data)) {
            return NextResponse.json(
                { error: 'Data must be an array of {x, y} objects' },
                { status: 400 }
            );
        }

        if (data.length < 2) {
            return NextResponse.json(
                { error: 'At least 2 data points are required' },
                { status: 400 }
            );
        }

        // Validate each data point
        const validatedData: DataPoint[] = [];
        for (let i = 0; i < data.length; i++) {
            const point = data[i];
            if (typeof point !== 'object' || point === null) {
                return NextResponse.json(
                    { error: `Data point at index ${i} is invalid` },
                    { status: 400 }
                );
            }

            const x = Number(point.x);
            const y = Number(point.y);

            if (isNaN(x) || isNaN(y)) {
                return NextResponse.json(
                    { error: `Data point at index ${i} has invalid x or y value` },
                    { status: 400 }
                );
            }

            validatedData.push({ x, y });
        }

        // Validate regression type
        const validTypes = ['linear', 'polynomial', 'exponential'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: `Invalid regression type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate polynomial degree if applicable
        let polynomialDegree = 2;
        if (type === 'polynomial' && degree !== undefined) {
            polynomialDegree = Number(degree);
            if (isNaN(polynomialDegree) || polynomialDegree < 1 || polynomialDegree > 10) {
                return NextResponse.json(
                    { error: 'Polynomial degree must be between 1 and 10' },
                    { status: 400 }
                );
            }
        }

        // Perform regression
        const result = performRegression(validatedData, type, polynomialDegree);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Regression error:', error);
        return NextResponse.json(
            {
                error: 'Regression calculation failed',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/regression
 * Returns information about the regression endpoint
 */
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        endpoint: '/api/regression',
        method: 'POST',
        description: 'Perform regression analysis on X-Y data',
        request: {
            data: 'Array of {x, y} objects',
            type: 'linear | polynomial | exponential',
            degree: 'Optional polynomial degree (1-10, default: 2)'
        },
        response: {
            type: 'Regression type used',
            formula: 'Mathematical formula string',
            coefficients: 'Array of regression coefficients',
            r2: 'R² (coefficient of determination)',
            mae: 'Mean Absolute Error',
            rmse: 'Root Mean Square Error',
            predictions: 'Predicted y values for each x'
        }
    });
}
