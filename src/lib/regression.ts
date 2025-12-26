import { DataPoint, RegressionResult } from '@/types';

/**
 * Calculate the mean of an array of numbers
 */
function mean(arr: number[]): number {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Calculate R² (coefficient of determination)
 */
function calculateR2(actual: number[], predicted: number[]): number {
    const actualMean = mean(actual);
    const ssTotal = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    const ssResidual = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    return 1 - (ssResidual / ssTotal);
}

/**
 * Calculate Mean Absolute Error
 */
function calculateMAE(actual: number[], predicted: number[]): number {
    const sum = actual.reduce((acc, val, i) => acc + Math.abs(val - predicted[i]), 0);
    return sum / actual.length;
}

/**
 * Calculate Root Mean Square Error
 */
function calculateRMSE(actual: number[], predicted: number[]): number {
    const sum = actual.reduce((acc, val, i) => acc + Math.pow(val - predicted[i], 2), 0);
    return Math.sqrt(sum / actual.length);
}

/**
 * Linear Regression: y = a + bx
 */
export function linearRegression(data: DataPoint[]): RegressionResult {
    const n = data.length;
    if (n < 2) {
        throw new Error('At least 2 data points are required for regression');
    }

    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);

    const xMean = mean(xValues);
    const yMean = mean(yValues);

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
        numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
        denominator += Math.pow(xValues[i] - xMean, 2);
    }

    const b = numerator / denominator;
    const a = yMean - b * xMean;

    const predictions = xValues.map(x => a + b * x);

    return {
        type: 'linear',
        formula: `y = ${a.toFixed(4)} + ${b.toFixed(4)}x`,
        coefficients: [a, b],
        r2: calculateR2(yValues, predictions),
        mae: calculateMAE(yValues, predictions),
        rmse: calculateRMSE(yValues, predictions),
        predictions
    };
}

/**
 * Polynomial Regression: y = a₀ + a₁x + a₂x² + ... + aₙxⁿ
 * Uses matrix operations for least squares fitting
 */
export function polynomialRegression(data: DataPoint[], degree: number = 2): RegressionResult {
    const n = data.length;
    if (n < degree + 1) {
        throw new Error(`At least ${degree + 1} data points are required for polynomial regression of degree ${degree}`);
    }

    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);

    // Build the Vandermonde matrix
    const X: number[][] = [];
    for (let i = 0; i < n; i++) {
        const row: number[] = [];
        for (let j = 0; j <= degree; j++) {
            row.push(Math.pow(xValues[i], j));
        }
        X.push(row);
    }

    // Solve using normal equations: (X^T * X) * coeffs = X^T * y
    const XtX: number[][] = [];
    const XtY: number[] = [];

    for (let i = 0; i <= degree; i++) {
        XtX.push([]);
        for (let j = 0; j <= degree; j++) {
            let sum = 0;
            for (let k = 0; k < n; k++) {
                sum += X[k][i] * X[k][j];
            }
            XtX[i].push(sum);
        }

        let sum = 0;
        for (let k = 0; k < n; k++) {
            sum += X[k][i] * yValues[k];
        }
        XtY.push(sum);
    }

    // Gaussian elimination with partial pivoting
    const coefficients = solveLinearSystem(XtX, XtY);

    // Calculate predictions
    const predictions = xValues.map(x => {
        let y = 0;
        for (let i = 0; i <= degree; i++) {
            y += coefficients[i] * Math.pow(x, i);
        }
        return y;
    });

    // Build formula string
    let formula = `y = ${coefficients[0].toFixed(4)}`;
    for (let i = 1; i <= degree; i++) {
        const sign = coefficients[i] >= 0 ? '+' : '';
        const superscript = i > 1 ? `^${i}` : '';
        formula += ` ${sign} ${coefficients[i].toFixed(4)}x${superscript}`;
    }

    return {
        type: 'polynomial',
        formula,
        coefficients,
        r2: calculateR2(yValues, predictions),
        mae: calculateMAE(yValues, predictions),
        rmse: calculateRMSE(yValues, predictions),
        predictions
    };
}

/**
 * Solve a system of linear equations using Gaussian elimination
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;
    const augmented: number[][] = A.map((row, i) => [...row, b[i]]);

    // Forward elimination with partial pivoting
    for (let col = 0; col < n; col++) {
        // Find pivot
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
                maxRow = row;
            }
        }
        [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];

        // Eliminate
        for (let row = col + 1; row < n; row++) {
            const factor = augmented[row][col] / augmented[col][col];
            for (let j = col; j <= n; j++) {
                augmented[row][j] -= factor * augmented[col][j];
            }
        }
    }

    // Back substitution
    const x: number[] = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = augmented[i][n];
        for (let j = i + 1; j < n; j++) {
            sum -= augmented[i][j] * x[j];
        }
        x[i] = sum / augmented[i][i];
    }

    return x;
}

/**
 * Exponential Regression: y = a * e^(bx)
 * Uses linearization: ln(y) = ln(a) + bx
 */
export function exponentialRegression(data: DataPoint[]): RegressionResult {
    const n = data.length;
    if (n < 2) {
        throw new Error('At least 2 data points are required for regression');
    }

    // Filter out non-positive y values (can't take log of zero or negative)
    const filteredData = data.filter(d => d.y > 0);
    if (filteredData.length < 2) {
        throw new Error('At least 2 data points with positive y values are required for exponential regression');
    }

    const xValues = filteredData.map(d => d.x);
    const lnYValues = filteredData.map(d => Math.log(d.y));

    // Linear regression on transformed data
    const xMean = mean(xValues);
    const lnYMean = mean(lnYValues);

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < filteredData.length; i++) {
        numerator += (xValues[i] - xMean) * (lnYValues[i] - lnYMean);
        denominator += Math.pow(xValues[i] - xMean, 2);
    }

    const b = numerator / denominator;
    const lnA = lnYMean - b * xMean;
    const a = Math.exp(lnA);

    // Calculate predictions for all original data points
    const allXValues = data.map(d => d.x);
    const predictions = allXValues.map(x => a * Math.exp(b * x));
    const yValues = data.map(d => d.y);

    return {
        type: 'exponential',
        formula: `y = ${a.toFixed(4)} × e^(${b.toFixed(4)}x)`,
        coefficients: [a, b],
        r2: calculateR2(yValues, predictions),
        mae: calculateMAE(yValues, predictions),
        rmse: calculateRMSE(yValues, predictions),
        predictions
    };
}

/**
 * Perform regression based on the specified type
 */
export function performRegression(
    data: DataPoint[],
    type: 'linear' | 'polynomial' | 'exponential',
    degree?: number
): RegressionResult {
    switch (type) {
        case 'linear':
            return linearRegression(data);
        case 'polynomial':
            return polynomialRegression(data, degree || 2);
        case 'exponential':
            return exponentialRegression(data);
        default:
            throw new Error(`Unknown regression type: ${type}`);
    }
}
