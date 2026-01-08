'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import CsvUploader from '@/components/CsvUploader';
import Icon from '@/components/Icon';
import { TimeSeriesDataPoint, ModelType } from '@/types';
import { exportChartAsPNG, exportTimeSeriesAsCSV } from '@/lib/exportUtils';
import { forecast, getModelInfo, getAvailableModels } from '@/lib/onnxWebInference';

// Dynamic import for ChartComponent to avoid SSR issues
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

// Model options with display info
const MODEL_OPTIONS: { value: ModelType; label: string; description: string }[] = [
    { value: 'gbr', label: 'Gradient Boosting', description: 'Tabular ML dengan fitur lag & rolling stats' },
    { value: 'xgb', label: 'XGBoost', description: 'Extreme Gradient Boosting - akurasi tinggi' },
    { value: 'lstm', label: 'LSTM', description: 'Deep Learning sequence model' },
    { value: 'bilstm', label: 'BiLSTM', description: 'Bidirectional LSTM untuk pola kompleks' },
    { value: 'hybrid', label: 'Hybrid XGB+LSTM', description: 'Ensemble model XGBoost + LSTM (rekomendasi)' },
];

// Extended data point with enabled toggle
interface ToggleableDataPoint extends TimeSeriesDataPoint {
    enabled: boolean;
}

export default function PredictionPage() {
    // Sample data: 30 hari curah hujan (mm) - sesuai distribusi training (0-5mm range)
    const [historicalData, setHistoricalData] = useState<ToggleableDataPoint[]>([
        { date: '2024-11-01', value: 0.5, enabled: true },
        { date: '2024-11-02', value: 1.2, enabled: true },
        { date: '2024-11-03', value: 2.8, enabled: true },
        { date: '2024-11-04', value: 1.6, enabled: true },
        { date: '2024-11-05', value: 0.3, enabled: true },
        { date: '2024-11-06', value: 0.0, enabled: true },
        { date: '2024-11-07', value: 0.8, enabled: true },
        { date: '2024-11-08', value: 3.2, enabled: true },
        { date: '2024-11-09', value: 4.5, enabled: true },
        { date: '2024-11-10', value: 2.1, enabled: true },
        { date: '2024-11-11', value: 1.4, enabled: true },
        { date: '2024-11-12', value: 0.9, enabled: true },
        { date: '2024-11-13', value: 0.2, enabled: true },
        { date: '2024-11-14', value: 0.0, enabled: true },
        { date: '2024-11-15', value: 1.5, enabled: true },
        { date: '2024-11-16', value: 2.8, enabled: true },
        { date: '2024-11-17', value: 3.6, enabled: true },
        { date: '2024-11-18', value: 2.2, enabled: true },
        { date: '2024-11-19', value: 1.1, enabled: true },
        { date: '2024-11-20', value: 0.6, enabled: true },
        { date: '2024-11-21', value: 0.0, enabled: true },
        { date: '2024-11-22', value: 0.4, enabled: true },
        { date: '2024-11-23', value: 1.8, enabled: true },
        { date: '2024-11-24', value: 3.2, enabled: true },
        { date: '2024-11-25', value: 4.8, enabled: true },
        { date: '2024-11-26', value: 3.5, enabled: true },
        { date: '2024-11-27', value: 2.1, enabled: true },
        { date: '2024-11-28', value: 1.3, enabled: true },
        { date: '2024-11-29', value: 0.7, enabled: true },
        { date: '2024-11-30', value: 0.0, enabled: true },
    ]);

    const [predictions, setPredictions] = useState<TimeSeriesDataPoint[]>([]);
    const [selectedModel, setSelectedModel] = useState<ModelType>('gbr');
    const [horizon, setHorizon] = useState(7);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modelMetrics, setModelMetrics] = useState<{ mae: number; rmse: number } | null>(null);
    const [usedModelName, setUsedModelName] = useState<string>('');

    // Visualization Settings
    const [chartTitle, setChartTitle] = useState('Data Historis & Prediksi Curah Hujan');
    const [xLabel, setXLabel] = useState('Tanggal');
    const [yLabel, setYLabel] = useState('Curah Hujan (mm)');
    const [historicalLabel, setHistoricalLabel] = useState('Data Historis');
    const [predictionLabel, setPredictionLabel] = useState('Prediksi');

    // Manual data input
    const [manualDate, setManualDate] = useState('');
    const [manualValue, setManualValue] = useState('');

    const handleCsvData = (csvData: { date: string; value: number }[]) => {
        const sorted = [...csvData].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setHistoricalData(sorted.map(d => ({ ...d, enabled: true })));
        setPredictions([]);
        setError(null);
    };

    const handleManualAdd = () => {
        if (!manualDate || !manualValue) {
            setError('Masukkan tanggal dan nilai');
            return;
        }

        const value = parseFloat(manualValue);
        if (isNaN(value) || value < 0) {
            setError('Nilai harus angka non-negatif');
            return;
        }

        const newPoint: ToggleableDataPoint = { date: manualDate, value, enabled: true };
        const newData = [...historicalData, newPoint].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setHistoricalData(newData);
        setManualDate('');
        setManualValue('');
        setError(null);
    };

    const handleTogglePoint = (index: number) => {
        const newData = [...historicalData];
        newData[index] = { ...newData[index], enabled: !newData[index].enabled };
        setHistoricalData(newData);
    };

    const handleClearAll = () => {
        setHistoricalData([]);
        setPredictions([]);
        setModelMetrics(null);
        setUsedModelName('');
    };

    const handleExportChart = () => {
        const canvas = document.querySelector('.chart-container canvas') as HTMLCanvasElement;
        exportChartAsPNG(canvas, 'prediction_chart');
    };

    const handleExportData = () => {
        const activeHistorical = historicalData.filter(d => d.enabled);
        exportTimeSeriesAsCSV(activeHistorical, predictions, 'prediction_data');
    };

    const runPrediction = useCallback(async () => {
        const activeData = historicalData.filter(d => d.enabled);

        if (activeData.length < 7) {
            setError('Minimal 7 data historis aktif diperlukan');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Use client-side ONNX inference (works on Vercel)
            const predictedValues = await forecast(
                selectedModel,
                activeData,
                horizon,
                (day, total) => {
                    // Optional: progress callback
                    console.log(`[Prediction] Day ${day}/${total}`);
                }
            );

            // Get model info
            const modelInfo = getModelInfo(selectedModel);

            setPredictions(predictedValues);
            setModelMetrics({ mae: modelInfo.mae, rmse: modelInfo.rmse });
            setUsedModelName(modelInfo.displayName);

        } catch (err) {
            console.error('[Prediction Error]', err);
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat prediksi');
            setPredictions([]);
        } finally {
            setLoading(false);
        }
    }, [historicalData, selectedModel, horizon]);

    // Prepare chart data - only active data
    const activeHistorical = historicalData.filter(d => d.enabled);
    const chartData = {
        labels: [
            ...activeHistorical.map(d => d.date),
            ...predictions.map(d => d.date),
        ],
        datasets: [
            {
                label: historicalLabel,
                data: [
                    ...activeHistorical.map(d => d.value),
                    ...predictions.map(() => null),
                ],
                borderColor: 'rgba(99, 102, 241, 1)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                label: predictionLabel,
                data: [
                    ...activeHistorical.map(() => null),
                    ...predictions.map(d => d.value),
                ],
                borderColor: 'rgba(249, 115, 22, 1)',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                borderDash: [5, 5],
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: 'rgba(249, 115, 22, 1)',
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
                        Prediksi curah hujan 1-30 hari ke depan menggunakan model Machine Learning (GBR, LSTM, BiLSTM).
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
                                    disabled={historicalData.length === 0}
                                >
                                    Clear All
                                </button>
                            </div>

                            <CsvUploader
                                onDataLoaded={handleCsvData}
                                mode="timeseries"
                                label="Upload CSV (kolom: date, value)"
                            />

                            <div className="mt-3">
                                <label className="label">ATAU TAMBAH MANUAL:</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <input
                                        type="date"
                                        className="input"
                                        value={manualDate}
                                        onChange={(e) => setManualDate(e.target.value)}
                                        style={{ flex: 1, minWidth: '140px' }}
                                    />
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder="Nilai"
                                        value={manualValue}
                                        onChange={(e) => setManualValue(e.target.value)}
                                        min="0"
                                        step="0.1"
                                        style={{ flex: 1, minWidth: '100px' }}
                                    />
                                    <button className="btn btn-secondary" onClick={handleManualAdd}>
                                        Tambah
                                    </button>
                                </div>
                            </div>

                            {/* Data Table with Checkbox Toggle */}
                            <div className="mt-3">
                                <div className="table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }}>#</th>
                                                <th style={{ width: '50px' }}>Aktif</th>
                                                <th>Tanggal</th>
                                                <th>Nilai (mm)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historicalData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                                        Belum ada data.
                                                    </td>
                                                </tr>
                                            ) : (
                                                historicalData.slice(-10).map((point, idx) => {
                                                    const actualIdx = historicalData.length - 10 + idx;
                                                    const displayIdx = actualIdx >= 0 ? actualIdx : idx;
                                                    return (
                                                        <tr
                                                            key={displayIdx}
                                                            style={{ opacity: point.enabled ? 1 : 0.5 }}
                                                        >
                                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                                {displayIdx + 1}
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={point.enabled}
                                                                    onChange={() => handleTogglePoint(displayIdx)}
                                                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                                />
                                                            </td>
                                                            <td style={{ fontSize: '0.85rem' }}>{point.date}</td>
                                                            <td style={{ fontSize: '0.85rem' }}>{point.value.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                    Total: {historicalData.length} | Aktif: {activeHistorical.length}
                                    {historicalData.length > 10 && ' (menampilkan 10 terakhir)'}
                                </p>
                            </div>

                            <button
                                className="btn btn-secondary mt-2"
                                onClick={handleExportData}
                                disabled={historicalData.length === 0}
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
                                    <label className="label">LABEL DATA HISTORIS</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={historicalLabel}
                                        onChange={(e) => setHistoricalLabel(e.target.value)}
                                        placeholder="Data Historis"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">LABEL PREDIKSI</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={predictionLabel}
                                        onChange={(e) => setPredictionLabel(e.target.value)}
                                        placeholder="Prediksi"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========== RIGHT COLUMN: VISUALIZATION + METHOD + METRICS + VALUES ========== */}
                    <div>
                        {/* 1. VISUALIZATION Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Visualisasi</h3>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={handleExportChart}
                                    disabled={historicalData.length === 0}
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
                                    height={300}
                                />
                            </div>
                        </div>

                        {/* 2. PREDICTION METHOD Card */}
                        <div className="card mb-3">
                            <div className="card-header">
                                <h3 className="card-title">Metode Prediksi</h3>
                            </div>

                            <div className="form-group">
                                <label className="label">PILIH MODEL</label>
                                <div className="tabs">
                                    {MODEL_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            className={`tab ${selectedModel === opt.value ? 'active' : ''}`}
                                            onClick={() => setSelectedModel(opt.value)}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                    {MODEL_OPTIONS.find(m => m.value === selectedModel)?.description}
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="label">HORIZON PREDIKSI (HARI)</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={horizon}
                                    onChange={(e) => setHorizon(parseInt(e.target.value))}
                                    style={{ width: '100%', cursor: 'pointer' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <span>1</span>
                                    <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{horizon} hari</span>
                                    <span>30</span>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={runPrediction}
                                disabled={loading || activeHistorical.length < 7}
                                style={{ width: '100%' }}
                            >
                                {loading ? (
                                    <><Icon name="spinner" size={16} className="spin" /> Memproses...</>
                                ) : (
                                    <><Icon name="rocket" size={16} /> Jalankan Prediksi</>
                                )}
                            </button>

                            {error && (
                                <div className="alert alert-error mt-2">{error}</div>
                            )}
                        </div>

                        {/* 3. ACCURACY METRICS Card */}
                        {modelMetrics && (
                            <div className="card mb-3">
                                <div className="card-header">
                                    <h3 className="card-title">Metrik Akurasi</h3>
                                    {usedModelName && (
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '4px 10px',
                                            background: 'var(--primary-gradient)',
                                            color: 'white',
                                            borderRadius: '20px',
                                        }}>
                                            {usedModelName}
                                        </span>
                                    )}
                                </div>
                                <div className="metrics-grid">
                                    <div className="metric-card">
                                        <div className="metric-label">MAE</div>
                                        <div className="metric-value">{modelMetrics.mae.toFixed(2)}</div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="metric-label">RMSE</div>
                                        <div className="metric-value">{modelMetrics.rmse.toFixed(2)}</div>
                                    </div>
                                    <div className="metric-card">
                                        <div className="metric-label">Horizon</div>
                                        <div className="metric-value">{horizon} hari</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. PREDICTED VALUES Card */}
                        {predictions.length > 0 && (
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Hasil Prediksi</h3>
                                </div>
                                <div className="table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Hari ke-</th>
                                                <th>Tanggal</th>
                                                <th>Prediksi (mm)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {predictions.map((pred, idx) => (
                                                <tr key={idx}>
                                                    <td>{idx + 1}</td>
                                                    <td>{pred.date}</td>
                                                    <td style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>
                                                        {pred.value.toFixed(2)}
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
