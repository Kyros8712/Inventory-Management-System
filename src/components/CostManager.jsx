import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Calculator } from 'lucide-react';

const CostManager = ({ data, loading, refresh }) => {
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ date: '', item: '', quantity: 0, unitPrice: 0 });
    const [isAdding, setIsAdding] = useState(false);

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData(item);
    };

    const handleSave = async (id) => {
        try {
            const response = await fetch(import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'updateCost', id, ...formData })
            });
            if (!response.ok) throw new Error();
            setEditingId(null);
            refresh();
        } catch (e) {
            alert('更新失敗，請確認後端連結。');
            setEditingId(null);
            refresh();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除嗎？')) return;
        try {
            await fetch(import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'deleteCost', id })
            });
            refresh();
        } catch (e) {
            alert('操作失敗 (模擬環境)');
            refresh();
        }
    };

    const handleAdd = async () => {
        try {
            const response = await fetch(import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'addCost', ...formData })
            });
            if (!response.ok) throw new Error();
            setIsAdding(false);
            setFormData({ date: '', item: '', quantity: 0, unitPrice: 0 });
            refresh();
        } catch (e) {
            alert('新增失敗，請確認後端連結。');
            setIsAdding(false);
            refresh();
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>單品成本管理</h2>
                <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                    <Plus size={16} /> 新增成本紀錄
                </button>
            </div>

            <div className="card">
                {loading ? <p>載入中...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>日期</th>
                                <th>品項</th>
                                <th>進貨量</th>
                                <th>單價</th>
                                <th>總價</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isAdding && (
                                <tr style={{ background: '#FFFBF0' }}>
                                    <td><input type="date" value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} /></td>
                                    <td><input type="text" placeholder="品項名稱" value={formData.item || ''} onChange={e => setFormData({ ...formData, item: e.target.value })} /></td>
                                    <td><input type="number" value={formData.quantity || 0} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} /></td>
                                    <td><input type="number" value={formData.unitPrice || 0} onChange={e => setFormData({ ...formData, unitPrice: parseInt(e.target.value) || 0 })} /></td>
                                    <td>${(formData.quantity || 0) * (formData.unitPrice || 0)}</td>
                                    <td>
                                        <button className="btn" onClick={handleAdd}><Check size={14} /></button>
                                        <button className="btn" onClick={() => setIsAdding(false)}><X size={14} /></button>
                                    </td>
                                </tr>
                            )}
                            {data.map((item) => (
                                <tr key={item.id}>
                                    {editingId === item.id ? (
                                        <>
                                            <td><input type="date" value={formData.date || ''} onChange={e => setFormData({ ...formData, date: e.target.value })} /></td>
                                            <td><input type="text" value={formData.item || ''} onChange={e => setFormData({ ...formData, item: e.target.value })} /></td>
                                            <td><input type="number" value={formData.quantity || 0} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} /></td>
                                            <td><input type="number" value={formData.unitPrice || 0} onChange={e => setFormData({ ...formData, unitPrice: parseInt(e.target.value) || 0 })} /></td>
                                            <td>${(formData.quantity || 0) * (formData.unitPrice || 0)}</td>
                                            <td>
                                                <button className="btn" onClick={() => handleSave(item.id)}><Check size={14} /></button>
                                                <button className="btn" onClick={() => setEditingId(null)}><X size={14} /></button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{item.date}</td>
                                            <td>{item.item}</td>
                                            <td>{item.quantity}</td>
                                            <td>${item.unitPrice}</td>
                                            <td>${item.totalPrice}</td>
                                            <td style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn" onClick={() => handleEdit(item)}><Edit2 size={14} /></button>
                                                <button className="btn" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CostManager;
