'use client';

import { DataPoint } from '@/types';
import Icon from './Icon';

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

    const handleAddRow = () => {
        const lastX = data.length > 0 ? data[data.length - 1].x : 0;
        onDataChange([...data, { x: lastX + 1, y: 0 }]);
    };

    const handleRemoveRow = (index: number) => {
        onDataChange(data.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>X</th>
                            <th>Y</th>
                            {editable && <th style={{ width: '80px' }}>Action</th>}
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
                                <tr key={index}>
                                    <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                                    <td>
                                        {editable ? (
                                            <input
                                                type="number"
                                                className="input input-sm"
                                                value={point.x}
                                                onChange={(e) => handleCellChange(index, 'x', e.target.value)}
                                                step="any"
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
                                            />
                                        ) : (
                                            point.y.toFixed(4)
                                        )}
                                    </td>
                                    {editable && (
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm btn-icon"
                                                onClick={() => handleRemoveRow(index)}
                                                title="Remove"
                                            >
                                                <Icon name="x" size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {editable && (
                <button className="btn btn-secondary btn-sm mt-2" onClick={handleAddRow}>
                    <Icon name="plus" size={16} />
                    Add Row
                </button>
            )}
        </div>
    );
}
