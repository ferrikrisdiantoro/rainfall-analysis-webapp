'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import CsvUploader from '@/components/CsvUploader';
import Icon from '@/components/Icon';
import { TimeSeriesDataPoint } from '@/types';

// Dynamic import for ChartComponent to avoid SSR issues
const ChartComponent = dynamic(() => import('@/components/ChartComponent'), {
    ssr: false,
    loading: () => (
        <div className="chart-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(99, 102, 241, 0.03)',
            minHeight: '350px'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                <span style={{ color: 'var(--text-muted)' }}>Loading chart...</span>
            </div>
        </div>
    ),
});

interface PredictionMetrics {
    mae: number;
    rmse: number;
    mape: number;
}

export default function PredictionPage() {
    // Dummy data: 30 hari curah hujan (mm) untuk demo visualisasi
    const [historicalData, setHistoricalData] = useState<TimeSeriesDataPoint[]>([
        { date: '2024-11-01', value: 12.5 },
        { date: '2024-11-02', value: 8.3 },
        { date: '2024-11-03', value: 0 },
        { date: '2024-11-04', value: 2.1 },
        { date: '2024-11-05', value: 15.7 },
        { date: '2024-11-06', value: 22.4 },
        { date: '2024-11-07', value: 18.9 },
        { date: '2024-11-08', value: 5.6 },
        { date: '2024-11-09', value: 0 },
        { date: '2024-11-10', value: 3.2 },
        { date: '2024-11-11', value: 9.8 },
        { date: '2024-11-12', value: 14.3 },
        { date: '2024-11-13', value: 28.6 },
        { date: '2024-11-14', value: 35.2 },
        { date: '2024-11-15', value: 19.7 },
        { date: '2024-11-16', value: 7.4 },
        { date: '2024-11-17', value: 0 },
        { date: '2024-11-18', value: 1.5 },
        { date: '2024-11-19', value: 11.2 },
        { date: '2024-11-20', value: 24.8 },
        { date: '2024-11-21', value: 31.5 },
        { date: '2024-11-22', value: 16.9 },
        { date: '2024-11-23', value: 8.7 },
        { date: '2024-11-24', value: 4.3 },
        { date: '2024-11-25', value: 0 },
        { date: '2024-11-26', value: 6.1 },
        { date: '2024-11-27', value: 13.4 },
        { date: '2024-11-28', value: 21.7 },
        { date: '2024-11-29', value: 17.3 },
        { date: '2024-11-30', value: 9.8 },
    ]);
    const [predictions, setPredictions] = useState<TimeSeriesDataPoint[]>([]);
    const [horizon, setHorizon] = useState(7);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<PredictionMetrics | null>(null);

    // Manual data input
    const [manualDate, setManualDate] = useState('');
    const [manualValue, setManualValue] = useState('');

    const handleCsvData = (csvData: { date: string; value: number }[]) => {
        // Sort by date
        const sorted = [...csvData].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setHistoricalData(sorted as TimeSeriesDataPoint[]);
        setPredictions([]);
        setMetrics(null);
    };

    const handleManualAdd = () => {
        if (!manualDate || manualValue === '') return;

        const value = Math.max(0, parseFloat(manualValue) || 0);
        const newPoint: TimeSeriesDataPoint = { date: manualDate, value };

        const newData = [...historicalData, newPoint].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setHistoricalData(newData);
        setManualDate('');
        setManualValue('');
        setPredictions([]);
        setMetrics(null);
    };

    const handleRemovePoint = (index: number) => {
        setHistoricalData(historicalData.filter((_, i) => i !== index));
        setPredictions([]);
        setMetrics(null);
    };

    const runPrediction = useCallback(async () => {
        if (historicalData.length < 7) {
            setError('At least 7 data points are required for prediction (for lag features)');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const newPredictions: TimeSeriesDataPoint[] = [];
            let currentData = [...historicalData];

            for (let i = 0; i < horizon; i++) {
                // Get last 7 values for lag features
                const lagFeatures = currentData.slice(-7).map((d) => d.value).reverse();

                // Call prediction API
                const response = await fetch('/api/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ features: lagFeatures }),
                });

                const json = await response.json();

                if (!response.ok) {
                    throw new Error(json.error || 'Prediction failed');
                }

                // Calculate next date
                const lastDate = new Date(currentData[currentData.length - 1].date);
                lastDate.setDate(lastDate.getDate() + 1);
                const nextDateStr = lastDate.toISOString().split('T')[0];

                const predictionValue = Math.max(0, json.prediction);
                const newPoint: TimeSeriesDataPoint = {
                    date: nextDateStr,
                    value: predictionValue,
                };

                newPredictions.push(newPoint);
                currentData.push(newPoint);
            }

            setPredictions(newPredictions);

            // Calculate metrics using the last available actual data as a reference
            // This is a simplified validation - in production you'd use a test set
            if (historicalData.length >= 14) {
                const testData = historicalData.slice(-7);
                const trainData = historicalData.slice(0, -7);

                // Make predictions on test data
                const testPredictions: number[] = [];
                let tempData = [...trainData];

                for (let i = 0; i < 7; i++) {
                    const lagFeatures = tempData.slice(-7).map((d) => d.value).reverse();

                    const response = await fetch('/api/predict', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ features: lagFeatures }),
                    });

                    const json = await response.json();
                    if (response.ok) {
                        const predVal = Math.max(0, json.prediction);
                        testPredictions.push(predVal);
                        tempData.push({ date: testData[i].date, value: predVal });
                    }
                }

                // Calculate metrics
                if (testPredictions.length === 7) {
                    const actualValues = testData.map((d) => d.value);

                    let maeSum = 0;
                    let rmseSum = 0;
                    let mapeSum = 0;
                    let mapeCount = 0;

                    for (let i = 0; i < 7; i++) {
                        const actual = actualValues[i];
                        const predicted = testPredictions[i];

                        maeSum += Math.abs(actual - predicted);
                        rmseSum += Math.pow(actual - predicted, 2);

                        if (actual !== 0) {
                            mapeSum += Math.abs((actual - predicted) / actual);
                            mapeCount++;
                        }
                    }

                    setMetrics({
                        mae: maeSum / 7,
                        rmse: Math.sqrt(rmseSum / 7),
                        mape: mapeCount > 0 ? (mapeSum / mapeCount) * 100 : 0,
                    });
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setPredictions([]);
        } finally {
            setLoading(false);
        }
    }, [historicalData, horizon]);

    // Prepare chart data
    const chartData = {
        labels: [
            ...historicalData.map((d) => d.date),
            ...predictions.map((d) => d.date),
        ],
        datasets: [
            {
                label: 'Historical Data',
                data: [
                    ...historicalData.map((d) => d.value),
                    ...new Array(predictions.length).fill(null),
                ],
                borderColor: 'rgba(99, 102, 241, 1)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                borderWidth: 3,
            },
            {
                label: 'Predictions',
                data: [
                    ...new Array(Math.max(0, historicalData.length - 1)).fill(null),
                    historicalData.length > 0 ? historicalData[historicalData.length - 1].value : null,
                    ...predictions.map((d) => d.value),
                ],
                borderColor: 'rgba(139, 92, 246, 1)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                borderDash: [8, 4],
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                borderWidth: 3,
            },
        ],
    };

    return (
        <div className="page-wrapper">
            <div className="container">
                <div className="section-header">
                    <h1 className="section-title">
                        <Icon name="crystal-ball" size={32} color="#8b5cf6" />
                        Prediksi Curah Hujan
                    </h1>
                    <p className="section-description">
                        Prediksi curah hujan ke depan menggunakan model ML (Gradient Boosting) dengan ONNX Runtime.
                    </p>
                </div>

                <div className="grid-2">
                    {/* Left Column - Input */}
                    <div>
                        {/* Settings Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Pengaturan Prediksi</h3>
                            </div>

                            <div className="form-group">
                                <label className="label">Prediction Horizon (Days)</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={horizon}
                                    onChange={(e) => setHorizon(parseInt(e.target.value))}
                                    className="input"
                                    style={{ cursor: 'pointer' }}
                                />
                                <div className="flex justify-between mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <span>1 day</span>
                                    <span><strong style={{ color: 'var(--accent-blue)' }}>{horizon} days</strong></span>
                                    <span>30 days</span>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={runPrediction}
                                disabled={loading || historicalData.length < 7}
                                style={{ width: '100%' }}
                            >
                                {loading ? (
                                    <span className="loading">
                                        <span className="spinner"></span> Predicting...
                                    </span>
                                ) : (
                                    <>
                                        <Icon name="rocket" size={18} />
                                        Run Prediction
                                    </>
                                )}
                            </button>

                            {historicalData.length < 7 && historicalData.length > 0 && (
                                <div className="alert alert-info mt-2">
                                    Need {7 - historicalData.length} more data points (minimum 7 required)
                                </div>
                            )}
                        </div>

                        {/* Data Input Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Historical Data</h3>
                            </div>

                            <CsvUploader
                                onDataLoaded={handleCsvData}
                                mode="timeseries"
                                label="Upload CSV (date, value columns)"
                            />

                            <div className="mt-3">
                                <label className="label">Or add manually:</label>
                                <div className="flex gap-1">
                                    <input
                                        type="date"
                                        className="input"
                                        value={manualDate}
                                        onChange={(e) => setManualDate(e.target.value)}
                                        placeholder="Date"
                                    />
                                    <input
                                        type="number"
                                        className="input"
                                        value={manualValue}
                                        onChange={(e) => setManualValue(e.target.value)}
                                        placeholder="Value"
                                        step="any"
                                    />
                                    <button className="btn btn-secondary" onClick={handleManualAdd}>
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="mt-3">
                                <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Date</th>
                                                <th>Value</th>
                                                <th style={{ width: '60px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historicalData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                        No data. Upload CSV or add manually.
                                                    </td>
                                                </tr>
                                            ) : (
                                                historicalData.map((point, index) => (
                                                    <tr key={index}>
                                                        <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                                                        <td>{point.date}</td>
                                                        <td>{point.value.toFixed(2)}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-danger btn-sm btn-icon"
                                                                onClick={() => handleRemovePoint(index)}
                                                            >
                                                                <Icon name="x" size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    Total: {historicalData.length} data points
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Results */}
                    <div>
                        {error && <div className="alert alert-error mb-3">{error}</div>}

                        {/* Metrics Card */}
                        {metrics && (
                            <div className="card mb-3">
                                <div className="card-header">
                                    <h3 className="card-title">Model Accuracy</h3>
                                </div>
                                <div className="metrics-grid">
                                    <div className="metric-card">
                                        <div className="metric-label">MAE</div>
                                        <div className="metric-value">{metrics.mae.toFixed(4)}</div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="metric-label">RMSE</div>
                                        <div className="metric-value">{metrics.rmse.toFixed(4)}</div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="metric-label">MAPE</div>
                                        <div className="metric-value">{metrics.mape.toFixed(2)}%</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chart Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Time Series Visualization</h3>
                            </div>
                            <ChartComponent
                                data={chartData}
                                title="Historical Data & Predictions"
                                xLabel="Date"
                                yLabel="Value"
                                height={400}
                            />
                        </div>

                        {/* Predictions Table */}
                        {predictions.length > 0 && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Predicted Values</h3>
                                </div>
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Day</th>
                                                <th>Date</th>
                                                <th>Predicted Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {predictions.map((pred, index) => (
                                                <tr key={index}>
                                                    <td>+{index + 1}</td>
                                                    <td>{pred.date}</td>
                                                    <td style={{ color: 'var(--accent-green)' }}>
                                                        {pred.value.toFixed(4)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
