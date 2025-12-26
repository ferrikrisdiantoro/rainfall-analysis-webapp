'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import CsvUploader from '@/components/CsvUploader';
import DataTable from '@/components/DataTable';
import Icon from '@/components/Icon';
import { DataPoint, RegressionResult } from '@/types';

// Dynamic import for ChartComponent to avoid SSR issues with Chart.js
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

type RegressionType = 'linear' | 'polynomial' | 'exponential';

export default function RegressionPage() {
    // Contoh data: Flow (X) vs Water Level (Y) dari sheet Regresi klien
    const [data, setData] = useState<DataPoint[]>([
        { x: 33262.03, y: 14.44 },
        { x: 48285.70, y: 18.16 },
        { x: 68609.89, y: 21.55 },
        { x: 86754.77, y: 23.38 },
        { x: 93855.33, y: 24.00 },
        { x: 100956.16, y: 24.76 },
        { x: 113156.71, y: 25.45 },
        { x: 121846.33, y: 26.31 },
        { x: 126080.48, y: 27.00 },
        { x: 133181.13, y: 27.83 },
    ]);
    const [regressionType, setRegressionType] = useState<RegressionType>('linear');
    const [polynomialDegree, setPolynomialDegree] = useState(2);
    const [result, setResult] = useState<RegressionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Perform regression when data or settings change
    const performRegression = useCallback(async () => {
        if (data.length < 2) {
            setResult(null);
            setError('At least 2 data points are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/regression', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data,
                    type: regressionType,
                    degree: polynomialDegree,
                }),
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || 'Regression failed');
            }

            setResult(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setResult(null);
        } finally {
            setLoading(false);
        }
    }, [data, regressionType, polynomialDegree]);

    useEffect(() => {
        performRegression();
    }, [performRegression]);

    const handleCsvData = (csvData: { x: number; y: number }[]) => {
        setData(csvData as DataPoint[]);
    };

    const handleManualAdd = () => {
        const lastX = data.length > 0 ? data[data.length - 1].x : 0;
        setData([...data, { x: lastX + 1, y: 0 }]);
    };

    // Prepare chart data
    const chartData = {
        datasets: [
            {
                type: 'scatter' as const,
                label: 'Data Points',
                data: data.map((p) => ({ x: p.x, y: p.y })),
                backgroundColor: 'rgba(99, 102, 241, 0.9)',
                borderColor: 'rgba(79, 70, 229, 1)',
                pointRadius: 8,
                pointHoverRadius: 12,
                pointBorderWidth: 2,
                pointHoverBorderWidth: 3,
            },
            ...(result
                ? [
                    {
                        type: 'line' as const,
                        label: `${regressionType.charAt(0).toUpperCase() + regressionType.slice(1)} Fit`,
                        data: data.map((p, i) => ({ x: p.x, y: result.predictions[i] })),
                        borderColor: 'rgba(139, 92, 246, 1)',
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        borderWidth: 3,
                        fill: true,
                        tension: regressionType === 'linear' ? 0 : 0.4,
                        pointRadius: 0,
                    },
                ]
                : []),
        ],
    };

    return (
        <div className="page-wrapper">
            <div className="container">
                <div className="section-header">
                    <h1 className="section-title">
                        <Icon name="chart-line" size={32} color="#6366f1" />
                        Analisis Regresi
                    </h1>
                    <p className="section-description">
                        Fitting data dengan model regresi Linear, Polynomial, atau Exponential.
                    </p>
                </div>

                <div className="grid-2">
                    {/* Left Column - Input */}
                    <div>
                        {/* Settings Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Settings</h3>
                            </div>

                            <div className="form-group">
                                <label className="label">Regression Type</label>
                                <div className="tabs">
                                    {(['linear', 'polynomial', 'exponential'] as RegressionType[]).map((type) => (
                                        <button
                                            key={type}
                                            className={`tab ${regressionType === type ? 'active' : ''}`}
                                            onClick={() => setRegressionType(type)}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {regressionType === 'polynomial' && (
                                <div className="form-group">
                                    <label className="label">Polynomial Degree</label>
                                    <select
                                        className="select"
                                        value={polynomialDegree}
                                        onChange={(e) => setPolynomialDegree(parseInt(e.target.value))}
                                    >
                                        {[2, 3, 4, 5, 6].map((d) => (
                                            <option key={d} value={d}>
                                                Degree {d}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Data Input Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Data Input</h3>
                                <button className="btn btn-secondary btn-sm" onClick={handleManualAdd}>
                                    + Add Point
                                </button>
                            </div>

                            <CsvUploader onDataLoaded={handleCsvData} mode="xy" label="Upload CSV" />

                            <div className="mt-3">
                                <DataTable data={data} onDataChange={setData} editable={true} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Results */}
                    <div>
                        {/* Formula Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Regression Formula</h3>
                                {loading && <span className="loading"><span className="spinner"></span></span>}
                            </div>

                            {error && <div className="alert alert-error">{error}</div>}

                            {result && (
                                <div className="formula-display">{result.formula}</div>
                            )}
                        </div>

                        {/* Metrics Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Accuracy Metrics</h3>
                            </div>

                            {result ? (
                                <div className="metrics-grid">
                                    <div className="metric-card">
                                        <div className="metric-label">R²</div>
                                        <div className="metric-value">{result.r2.toFixed(4)}</div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="metric-label">MAE</div>
                                        <div className="metric-value">{result.mae.toFixed(4)}</div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="metric-label">RMSE</div>
                                        <div className="metric-value">{result.rmse.toFixed(4)}</div>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>Add data to see metrics</p>
                            )}
                        </div>

                        {/* Chart Card */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Visualization</h3>
                            </div>
                            <ChartComponent
                                data={chartData}
                                title="Scatter Plot with Regression Curve"
                                xLabel="X"
                                yLabel="Y"
                                height={400}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
