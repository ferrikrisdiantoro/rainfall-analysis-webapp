'use client';

import { useRef, useState } from 'react';
import Papa from 'papaparse';
import Icon from './Icon';

interface XYData {
    x: number;
    y: number;
}

interface TimeSeriesData {
    date: string;
    value: number;
}

type CsvUploaderProps =
    | { mode: 'xy'; onDataLoaded: (data: XYData[]) => void; label?: string }
    | { mode: 'timeseries'; onDataLoaded: (data: TimeSeriesData[]) => void; label?: string };

export default function CsvUploader({ onDataLoaded, mode, label }: CsvUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFile = (file: File) => {
        setError(null);
        setFileName(file.name);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    if (mode === 'xy') {
                        const data = (results.data as Record<string, string>[]).map((row, index: number) => {
                            const x = parseFloat(row.x || row.X || row['0'] || '');
                            const y = parseFloat(row.y || row.Y || row['1'] || '');

                            if (isNaN(x) || isNaN(y)) {
                                throw new Error(`Invalid data at row ${index + 1}`);
                            }

                            return { x, y };
                        });
                        onDataLoaded(data);
                    } else {
                        const data = (results.data as Record<string, string>[]).map((row, index: number) => {
                            const date = row.date || row.Date || row.DATE || row['tanggal'] || row['Tanggal'] || '';
                            let value = parseFloat(row.value || row.Value || row.VALUE || row['nilai'] || row['Nilai'] || row['curah_hujan'] || '');

                            if (!date) {
                                throw new Error(`Missing date at row ${index + 1}`);
                            }

                            // Handle negative values - set to 0
                            if (isNaN(value) || value < 0) {
                                value = 0;
                            }

                            return { date, value };
                        });
                        onDataLoaded(data);
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to parse CSV');
                }
            },
            error: (err) => {
                setError(`CSV parsing error: ${err.message}`);
            },
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/csv') {
            handleFile(file);
        } else {
            setError('Please upload a CSV file');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    return (
        <div className="form-group">
            {label && <label className="label">{label}</label>}
            <div
                className={`file-upload ${isDragging ? 'dragover' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <div className="file-upload-icon">
                    <Icon name="upload" size={40} color="#6366f1" />
                </div>
                <div className="file-upload-text">
                    {fileName ? (
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {fileName}
                        </span>
                    ) : (
                        <>
                            <strong>Click to upload</strong> or drag and drop
                            <br />
                            <small>
                                {mode === 'xy'
                                    ? 'CSV with columns: x, y'
                                    : 'CSV with columns: date, value'}
                            </small>
                        </>
                    )}
                </div>
            </div>
            {error && <div className="alert alert-error mt-1">{error}</div>}
        </div>
    );
}
