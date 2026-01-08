'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import CsvUploader from '@/components/CsvUploader';
import DataTable from '@/components/DataTable';
import Icon from '@/components/Icon';
import { DataPoint, RegressionResult } from '@/types';
import { exportChartAsPNG, exportXYDataAsCSV } from '@/lib/exportUtils';

// Dynamic import for ChartComponent
const ChartComponent = dynamic(() => import('@/components/ChartComponent'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '350px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
            borderRadius: '12px',
            color: 'var(--text-muted)'
        }}>
            Loading chart...
        </div>
    ),
});

type RegressionType = 'linear' | 'polynomial' | 'exponential' | 'power' | 'logarithmic' | 'moving-average';

export default function RegressionPage() {
    // Sample data: Flow (X) vs Water Level (Y)
    const [data, setData] = useState<DataPoint[]>([
        { x: 33262.03, y: 14.44, enabled: true },
        { x: 48285.70, y: 18.16, enabled: true },
        { x: 68609.89, y: 21.55, enabled: true },
        { x: 86754.77, y: 23.38, enabled: true },
        { x: 93855.33, y: 24.00, enabled: true },
        { x: 100956.16, y: 24.76, enabled: true },
        { x: 113156.71, y: 25.45, enabled: true },
        { x: 121846.33, y: 26.31, enabled: true },
        { x: 126080.48, y: 27.00, enabled: true },
        { x: 133181.13, y: 27.83, enabled: true },
    ]);

    const [regressionType, setRegressionType] = useState<RegressionType>('linear');
    const [polynomialDegree, setPolynomialDegree] = useState(2);
    const [movingAvgWindow, setMovingAvgWindow] = useState(3);
    const [result, setResult] = useState<RegressionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Visualization Settings
    const [chartTitle, setChartTitle] = useState('Scatter Plot dengan Regression Curve');
    const [xLabel, setXLabel] = useState('X (Flow)');
    const [yLabel, setYLabel] = useState('Y (Water Level)');
    const [dataPointsLabel, setDataPointsLabel] = useState('Data Points');
    const [regressionFitLabel, setRegressionFitLabel] = useState('Regression Fit');

    // Perform regression when data or settings change
    const performRegression = useCallback(async () => {
        const activeData = data.filter(d => d.enabled !== false);

        if (activeData.length < 2) {
            setResult(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/regression', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: activeData,
                    type: regressionType,
                    degree: regressionType === 'moving-average' ? movingAvgWindow : polynomialDegree,
                }),
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || 'Regression failed');
            }

            setResult(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            setResult(null);
        } finally {
            setLoading(false);
        }
    }, [data, regressionType, polynomialDegree, movingAvgWindow]);

    // Auto-run regression when data or settings change
    useEffect(() => {
        const timeout = setTimeout(() => {
            performRegression();
        }, 300);
        return () => clearTimeout(timeout);
    }, [performRegression]);

    const handleCsvData = (csvData: { x: number; y: number }[]) => {
        const mapped = csvData.map(p => ({ x: p.x, y: p.y, enabled: true }));
        setData(mapped);
    };

    const handleClearAll = () => {
        setData([]);
        setResult(null);
    };

    const copyFormula = () => {
        if (result?.formula) {
            navigator.clipboard.writeText(result.formula);
        }
    };

    const handleExportChart = () => {
        const canvas = document.querySelector('.chart-container canvas') as HTMLCanvasElement;
        exportChartAsPNG(canvas, 'regression_chart');
    };

    const handleExportData = () => {
        exportXYDataAsCSV(data, 'regression_data');
    };

    // Prepare chart data
    const activeData = data.filter(d => d.enabled !== false);
    const chartData = {
        datasets: [
            {
                type: 'scatter' as const,
                label: dataPointsLabel,
                data: activeData.map((p) => ({ x: p.x, y: p.y })),
                backgroundColor: 'rgba(99, 102, 241, 0.9)',
                borderColor: 'rgba(79, 70, 229, 1)',
                pointRadius: 6,
                pointHoverRadius: 8,
            },
            ...(result
                ? [{
                    type: 'line' as const,
                    label: regressionFitLabel,
                    data: activeData.map((p, i) => ({ x: p.x, y: result.predictions[i] })),
                    borderColor: 'rgba(139, 92, 246, 1)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: regressionType === 'linear' ? 0 : 0.4,
                    pointRadius: 0,
                    pointStyle: 'line' as const,
                }]
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
                        Fitting data dengan model regresi Linear, Polynomial, Exponential, Power, Logarithmic, atau Moving Average.
                    </p>
                </div>

                <div className="grid-2">
                    {/* ========== LEFT COLUMN: DATA INPUT + VISUALIZATION SETTINGS ========== */}
                    <div>
                        {/* 1. DATA INPUT Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Input Data</h3>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={handleClearAll}
                                    disabled={data.length === 0}
                                >
                                    Clear All
                                </button>
                            </div>

                            <CsvUploader onDataLoaded={handleCsvData} mode="xy" label="Upload CSV (kolom X, Y)" />

                            <div className="mt-3">
                                <div className="table-wrapper" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <DataTable data={data} onDataChange={setData} editable={true} />
                                </div>
                            </div>

                            <button
                                className="btn btn-secondary mt-2"
                                onClick={handleExportData}
                                disabled={data.length === 0}
                                style={{ width: '100%' }}
                            >
                                <Icon name="download" size={16} />
                                Export Data CSV
                            </button>
                        </div>

                        {/* 2. VISUALIZATION SETTINGS Card */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Pengaturan Visualisasi</h3>
                            </div>
                            <div className="form-group">
                                <label className="label">JUDUL GRAFIK</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={chartTitle}
                                    onChange={(e) => setChartTitle(e.target.value)}
                                    placeholder="Masukkan judul grafik"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="label">LABEL SUMBU X</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={xLabel}
                                        onChange={(e) => setXLabel(e.target.value)}
                                        placeholder="X"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">LABEL SUMBU Y</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={yLabel}
                                        onChange={(e) => setYLabel(e.target.value)}
                                        placeholder="Y"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <div className="form-group">
                                    <label className="label">LABEL DATA POINTS</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={dataPointsLabel}
                                        onChange={(e) => setDataPointsLabel(e.target.value)}
                                        placeholder="Data Points"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">LABEL REGRESSION FIT</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={regressionFitLabel}
                                        onChange={(e) => setRegressionFitLabel(e.target.value)}
                                        placeholder="Regression Fit"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========== RIGHT COLUMN: VISUALIZATION + METHOD + FORMULA + METRICS ========== */}
                    <div>
                        {/* 1. VISUALIZATION Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Visualisasi</h3>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={handleExportChart}
                                    disabled={data.length === 0}
                                >
                                    <Icon name="download" size={14} />
                                    Export PNG
                                </button>
                            </div>
                            <div className="chart-container">
                                <ChartComponent
                                    data={chartData}
                                    title={chartTitle}
                                    xLabel={xLabel}
                                    yLabel={yLabel}
                                    height={350}
                                />
                            </div>
                        </div>

                        {/* 2. REGRESSION METHOD Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Metode Regresi</h3>
                            </div>
                            <div className="form-group">
                                <label className="label">PILIH METODE</label>
                                <select
                                    className="select"
                                    value={regressionType}
                                    onChange={(e) => setRegressionType(e.target.value as RegressionType)}
                                    style={{ width: '100%' }}
                                >
                                    <option value="linear">Linear (y = a + bx)</option>
                                    <option value="polynomial">Polynomial (Order n)</option>
                                    <option value="exponential">Exponential (y = ae^bx)</option>
                                    <option value="power">Power (y = ax^b)</option>
                                    <option value="logarithmic">Logarithmic (y = a + b ln x)</option>
                                    <option value="moving-average">Moving Average</option>
                                </select>
                            </div>

                            {regressionType === 'polynomial' && (
                                <div className="form-group">
                                    <label className="label">POLYNOMIAL DEGREE</label>
                                    <select
                                        className="select"
                                        value={polynomialDegree}
                                        onChange={(e) => setPolynomialDegree(parseInt(e.target.value))}
                                        style={{ width: '100%' }}
                                    >
                                        {[2, 3, 4, 5, 6].map((d) => (
                                            <option key={d} value={d}>Degree {d}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {regressionType === 'moving-average' && (
                                <div className="form-group">
                                    <label className="label">WINDOW SIZE</label>
                                    <select
                                        className="select"
                                        value={movingAvgWindow}
                                        onChange={(e) => setMovingAvgWindow(parseInt(e.target.value))}
                                        style={{ width: '100%' }}
                                    >
                                        {[2, 3, 5, 7, 10].map((w) => (
                                            <option key={w} value={w}>{w} points</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* 3. REGRESSION FORMULA Card */}
                        {result && (
                            <div className="card mb-3">
                                <div className="card-header">
                                    <h3 className="card-title">Formula Regresi</h3>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={copyFormula}
                                    >
                                        <Icon name="copy" size={14} />
                                        Copy
                                    </button>
                                </div>
                                <div className="formula-display">
                                    {result.formula}
                                </div>
                            </div>
                        )}

                        {/* 4. ACCURACY METRICS Card */}
                        {result && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Metrik Akurasi</h3>
                                </div>
                                <div className="metrics-grid">
                                    <div className="metric-card">
                                        <div className="metric-label">R² (Coeff. Det.)</div>
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
                                <p style={{
                                    marginTop: '12px',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    Dihitung dari {activeData.length} data point aktif.
                                </p>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="alert alert-error mt-3">
                                {error}
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="alert alert-info mt-3">
                                <Icon name="spinner" size={16} className="spin" /> Menghitung regresi...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
