'use client';

import { DataPoint } from '@/types';

interface DataTableProps {
    data: DataPoint[];
    onDataChange: (data: DataPoint[]) => void;
    editable?: boolean;
}

export default function DataTable({ data, onDataChange, editable = true }: DataTableProps) {
    const handleCellChange = (index: number, field: 'x' | 'y', value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            const newData = [...data];
            newData[index] = { ...newData[index], [field]: numValue };
            onDataChange(newData);
        }
    };

    const handleToggle = (index: number) => {
        const newData = [...data];
        newData[index] = { ...newData[index], enabled: !newData[index].enabled };
        onDataChange(newData);
    };

    const handleAddRow = () => {
        const lastX = data.length > 0 ? data[data.length - 1].x : 0;
        onDataChange([...data, { x: lastX + 1, y: 0, enabled: true }]);
    };

    // Removed handleRemoveRow as per requirement to rely on enabling/disabling
    // But keep logic if we want a manual delete for empty rows? 
    // PDF says "Data bukan dihapus... tapi hanya di add/remove dari grafik... ganti action delete menjadi checkbox".
    // So "Delete" is GONE. Checkbox IS the action.

    return (
        <div>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            {editable && <th style={{ width: '60px' }}>Active</th>}
                            <th>X</th>
                            <th>Y</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={editable ? 4 : 3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No data. Add data points or upload a CSV.
                                </td>
                            </tr>
                        ) : (
                            data.map((point, index) => (
                                <tr key={index} style={{ opacity: point.enabled === false ? 0.5 : 1 }}>
                                    <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                                    {editable && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={point.enabled !== false}
                                                onChange={() => handleToggle(index)}
                                                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                            />
                                        </td>
                                    )}
                                    <td>
                                        {editable ? (
                                            <input
                                                type="number"
                                                className="input input-sm"
                                                value={point.x}
                                                onChange={(e) => handleCellChange(index, 'x', e.target.value)}
                                                step="any"
                                                disabled={point.enabled === false}
                                            />
                                        ) : (
                                            point.x.toFixed(4)
                                        )}
                                    </td>
                                    <td>
                                        {editable ? (
                                            <input
                                                type="number"
                                                className="input input-sm"
                                                value={point.y}
                                                onChange={(e) => handleCellChange(index, 'y', e.target.value)}
                                                step="any"
                                                disabled={point.enabled === false}
                                            />
                                        ) : (
                                            point.y.toFixed(4)
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {editable && (
                <div className="flex justify-between mt-2">
                    <button className="btn btn-secondary btn-sm" onClick={handleAddRow}>
                        + Row
                    </button>
                    {/* Clear All will be handled by parent */}
                </div>
            )}
        </div>
    );
}
