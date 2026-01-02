/**
 * Export utilities for charts and data
 */

/**
 * Export chart canvas as PNG image
 * @param chartRef - Reference to Chart.js chart instance
 * @param filename - Filename without extension
 */
export function exportChartAsPNG(
    chartCanvas: HTMLCanvasElement | null,
    filename: string = 'chart'
): void {
    if (!chartCanvas) {
        console.error('Chart canvas not found');
        return;
    }

    try {
        const url = chartCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = url;
        link.click();
    } catch (error) {
        console.error('Failed to export chart:', error);
    }
}

/**
 * Export data as CSV file
 * @param data - Array of data objects
 * @param columns - Column definitions with key and header
 * @param filename - Filename without extension
 */
export function exportDataAsCSV<T extends Record<string, unknown>>(
    data: T[],
    columns: { key: keyof T; header: string }[],
    filename: string = 'data'
): void {
    if (!data || data.length === 0) {
        console.error('No data to export');
        return;
    }

    try {
        // Create header row
        const headerRow = columns.map(col => col.header).join(',');

        // Create data rows
        const dataRows = data.map(row =>
            columns.map(col => {
                const value = row[col.key];
                // Escape strings with commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return String(value ?? '');
            }).join(',')
        );

        // Combine header and data
        const csvContent = [headerRow, ...dataRows].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to export CSV:', error);
    }
}

/**
 * Export XY data points as CSV
 */
export function exportXYDataAsCSV(
    data: { x: number; y: number; enabled?: boolean }[],
    filename: string = 'regression_data'
): void {
    const activeData = data.filter(d => d.enabled !== false);
    exportDataAsCSV(
        activeData,
        [
            { key: 'x', header: 'X' },
            { key: 'y', header: 'Y' },
        ],
        filename
    );
}

/**
 * Export time series data (historical + predictions) as CSV
 */
export function exportTimeSeriesAsCSV(
    historical: { date: string; value: number }[],
    predictions: { date: string; value: number }[],
    filename: string = 'prediction_data'
): void {
    const combinedData = [
        ...historical.map(d => ({ date: d.date, value: d.value, type: 'Historical' })),
        ...predictions.map(d => ({ date: d.date, value: d.value, type: 'Prediction' })),
    ];

    exportDataAsCSV(
        combinedData,
        [
            { key: 'date', header: 'Date' },
            { key: 'value', header: 'Value' },
            { key: 'type', header: 'Type' },
        ],
        filename
    );
}
