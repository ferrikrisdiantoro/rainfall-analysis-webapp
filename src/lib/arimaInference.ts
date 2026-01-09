// import ARIMA from 'arima'; 

// Async loader for ARIMA module (required for WASM in browser)
const loadARIMA = async () => {
    try {
        // Try async import first (browser/Next.js preferred for WASM)
        // Note: next.config.ts must have asyncWebAssembly: true
        // @ts-ignore - arima package doesn't have type definitions for async entry
        const module = await import('arima/async');
        return module.default || module;
    } catch (e) {
        console.warn('Failed to load arima/async, falling back to sync require', e);
        // Fallback for Node/Server environment if async fails
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('arima');
    }
};

export interface ARIMAConfig {
    p: number;  // AR order
    d: number;  // Differencing order
    q: number;  // MA order
    P?: number; // Seasonal AR order
    D?: number; // Seasonal differencing
    Q?: number; // Seasonal MA order
    s?: number; // Seasonal period (e.g., 12 for monthly, 7 for daily)
    verbose?: boolean;
}

export const ARIMA_PRESETS = {
    arima_111: { p: 1, d: 1, q: 1, name: 'ARIMA(1,1,1)', description: 'Simple ARIMA' },
    arima_211: { p: 2, d: 1, q: 1, name: 'ARIMA(2,1,1)', description: 'Extended AR' },
    arima_112: { p: 1, d: 1, q: 2, name: 'ARIMA(1,1,2)', description: 'Extended MA' },
    sarima_weekly: {
        p: 1, d: 1, q: 1,
        P: 1, D: 1, Q: 1, s: 7,
        name: 'SARIMA(1,1,1)(1,1,1)7',
        description: 'Seasonal ARIMA (weekly)'
    },
    auto: { p: 0, d: 0, q: 0, name: 'Auto ARIMA', description: 'Automatic parameter selection' },
};

export type ARIMAPresetType = keyof typeof ARIMA_PRESETS;

/**
 * Fit ARIMA model and forecast
 */
export async function arimaForecast(
    historicalValues: number[],
    horizon: number,
    config: ARIMAConfig = { p: 1, d: 1, q: 1 }
): Promise<number[]> {
    if (historicalValues.length < 10) {
        throw new Error('ARIMA requires at least 10 historical data points');
    }

    // Load ARIMA module dynamically
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const ARIMA = await loadARIMA();

    const runModel = (cfg: any) => {
        try {
            const arima = new ARIMA({ ...cfg, verbose: false });
            arima.train(historicalValues);
            const [preds] = arima.predict(horizon);
            return preds;
        } catch (err) {
            console.warn('[ARIMA] Training error:', err);
            return Array(horizon).fill(0);
        }
    };

    let predictions: number[] = [];

    // 1. Try requested config (or Auto)
    if (config.p === 0 && config.d === 0 && config.q === 0) {
        // Auto mode
        const autoArima = new ARIMA({ auto: true, verbose: false });
        autoArima.train(historicalValues);
        const [preds] = autoArima.predict(horizon);
        predictions = preds;
        console.log('[ARIMA] Auto selected:', { p: autoArima.p, d: autoArima.d, q: autoArima.q });
    } else {
        // Manual config
        predictions = runModel(config);
    }

    // 2. Check for "Zero Prediction" issue (common in sparse rainfall data with differencing)
    // If sum of absolute predictions is very small, it likely failed to capture signal or over-differenced.
    const sumAbs = predictions.reduce((sum: number, v: number) => sum + Math.abs(v), 0);
    const isExamplesZero = sumAbs < 0.1;

    if (isExamplesZero) {
        console.warn('[ARIMA] Sparse data detected (predictions ~0). Retrying with d=0 (Mean/AR model).');

        // Strategy 2: Force d=0 to capture mean/trend instead of differences
        // Use AR(1) or simplistic model
        const fallbackConfig = { p: 1, d: 0, q: 0, verbose: false };
        const fallbackPreds = runModel(fallbackConfig);

        // If fallback also zero, maybe simple moving average of last 30 days?
        if (fallbackPreds.some((v: number) => Math.abs(v) > 0.01)) {
            predictions = fallbackPreds;
            console.log('[ARIMA] Fallback d=0 successful.');
        } else {
            console.log('[ARIMA] Fallback d=0 also returned zeros. Using Climatology (Historical Mean).');
            const nonZeros = historicalValues.filter(v => v > 0);
            const mean = nonZeros.length > 0
                ? nonZeros.reduce((a, b) => a + b, 0) / nonZeros.length
                : 0;
            if (mean > 0) predictions = Array(horizon).fill(mean);
        }
    }

    // 3. Ensure non-negative (rainfall >= 0)
    return predictions.map((v: number) => Math.max(0, v));
}

/**
 * Auto ARIMA - automatically selects best parameters
 */
export async function autoArimaForecast(
    historicalValues: number[],
    horizon: number
): Promise<{ predictions: number[]; params: { p: number; d: number; q: number } }> {
    if (historicalValues.length < 10) {
        throw new Error('Auto ARIMA requires at least 10 historical data points');
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const ARIMA = await loadARIMA();

    const arima = new ARIMA({
        auto: true,
        verbose: false,
    });

    arima.train(historicalValues);
    const [predictions] = arima.predict(horizon);

    return {
        predictions: predictions.map((v: number) => Math.max(0, v)),
        params: {
            p: arima.p || 1,
            d: arima.d || 1,
            q: arima.q || 1
        }
    };
}

/**
 * Full ARIMA forecast with date generation
 */
export async function arimaForecastWithDates(
    historicalData: { date: string; value: number }[],
    horizon: number,
    config: ARIMAConfig = { p: 1, d: 1, q: 1 },
    onProgress?: (step: number, total: number) => void
): Promise<{ date: string; value: number }[]> {
    const sortedData = [...historicalData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const values = sortedData.map(d => Math.max(0, d.value));
    const lastDate = new Date(sortedData[sortedData.length - 1].date);

    if (onProgress) onProgress(0, horizon);

    const predictions = await arimaForecast(values, horizon, config);

    const results: { date: string; value: number }[] = [];
    for (let i = 0; i < horizon; i++) {
        const targetDate = new Date(lastDate);
        targetDate.setDate(targetDate.getDate() + i + 1);

        results.push({
            date: targetDate.toISOString().split('T')[0],
            value: Math.round(predictions[i] * 100) / 100,
        });

        if (onProgress) onProgress(i + 1, horizon);
    }

    return results;
}
