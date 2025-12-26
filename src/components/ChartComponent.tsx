'use client';

import { useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
    ChartData,
    ScatterController,
    LineController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ScatterController,
    LineController
);

interface ChartComponentProps {
    data: ChartData<'line' | 'scatter'>;
    title?: string;
    xLabel?: string;
    yLabel?: string;
    height?: number;
    type?: 'line' | 'scatter';
}

export default function ChartComponent({
    data,
    title,
    xLabel = 'X',
    yLabel = 'Y',
    height = 350,
    type = 'line',
}: ChartComponentProps) {
    const chartRef = useRef<ChartJS<'line' | 'scatter'>>(null);

    useEffect(() => {
        // Update chart when data changes
        if (chartRef.current) {
            chartRef.current.update();
        }
    }, [data]);

    // Check if this is scatter/xy data (has data points with x,y objects)
    const isScatterData = data.datasets?.some(ds =>
        ds.data?.some((point: unknown) =>
            typeof point === 'object' && point !== null && 'x' in point && 'y' in point
        )
    );

    const options: ChartOptions<'line' | 'scatter'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'nearest',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#475569',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                    },
                    usePointStyle: true,
                    padding: 16,
                },
            },
            title: title
                ? {
                    display: true,
                    text: title,
                    color: '#1e293b',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 16,
                        weight: 'bold',
                    },
                    padding: { bottom: 20 },
                }
                : undefined,
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        const raw = context.raw as { x?: number; y?: number } | number | null;
                        if (raw === null || raw === undefined) return '';

                        if (typeof raw === 'object' && 'x' in raw && 'y' in raw) {
                            return `${context.dataset.label}: (${raw.x?.toFixed(2)}, ${raw.y?.toFixed(2)})`;
                        }
                        const value = context.parsed.y;
                        if (value === null || value === undefined) return '';
                        return `${context.dataset.label}: ${value.toFixed(4)}`;
                    },
                },
            },
        },
        scales: {
            x: {
                type: isScatterData ? 'linear' : 'category',
                title: {
                    display: true,
                    text: xLabel,
                    color: '#475569',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 10,
                        weight: 'bold',
                    },
                },
                grid: {
                    color: 'rgba(99, 102, 241, 0.08)',
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        size: 9,
                    },
                    maxRotation: 45,
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 10,
                },
                ...(isScatterData && {
                    beginAtZero: false,
                }),
            },
            y: {
                type: 'linear',
                title: {
                    display: true,
                    text: yLabel,
                    color: '#475569',
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                        weight: 'bold',
                    },
                },
                grid: {
                    color: 'rgba(99, 102, 241, 0.08)',
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        size: 11,
                    },
                },
                beginAtZero: false,
            },
        },
    };

    // Determine chart type
    const chartType = isScatterData ? 'scatter' as const : type;

    return (
        <div className="chart-container" style={{ height }}>
            <Chart
                ref={chartRef as React.RefObject<ChartJS<typeof chartType>>}
                type={chartType}
                data={data as ChartData<typeof chartType>}
                options={options as ChartOptions<typeof chartType>}
            />
        </div>
    );
}
