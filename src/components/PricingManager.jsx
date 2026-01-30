import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, TrendingUp } from 'lucide-react';

const PricingManager = ({ data, loading, refresh }) => {
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ item: '', unitCost: 0, price: 0 });
    const [isAdding, setIsAdding] = useState(false);

    const calculateMargin = (cost, price) => {
        if (!price || price === 0) return '0%';
        const margin = ((price - cost) / price) * 100;
        return `${margin.toFixed(1)}%`;
    };

    const handleEdit = (item) => {
        setEditingItem(item.item);
        setFormData(item);
    };

    const handleSave = async (itemName) => {
        try {
            const response = await fetch(import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'updatePricing', originalItem: itemName, ...formData })
            });
            if (!response.ok) throw new Error();
            setEditingItem(null);
            refresh();
        } catch (e) {
            alert('更新失敗，請確認後端連結。');
            setEditingItem(null);
            refresh();
        }
    };

    const handleDelete = async (itemName) => {
        if (!confirm(`確定要刪除 ${itemName} 的定價嗎？`)) return;
        try {
            await fetch(import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'deletePricing', item: itemName })
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
                body: JSON.stringify({ action: 'addPricing', ...formData })
            });
            if (!response.ok) throw new Error();
            setIsAdding(false);
            setFormData({ item: '', unitCost: 0, price: 0 });
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
                <h2>單品定價管理</h2>
                <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                    <Plus size={16} /> 新增定價
                </button>
            </div>

            <div className="card">
                {loading ? <p>載入中...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>品項</th>
                                <th>進貨單價 (Cost)</th>
                                <th>定價 (Price)</th>
                                <th>毛利率 (Margin)</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isAdding && (
                                <tr style={{ background: '#FFFBF0' }}>
                                    <td><input type="text" placeholder="品項名稱" value={formData.item || ''} onChange={e => setFormData({ ...formData, item: e.target.value })} /></td>
                                    <td><input type="number" value={formData.unitCost || 0} onChange={e => setFormData({ ...formData, unitCost: parseInt(e.target.value) || 0 })} /></td>
                                    <td><input type="number" value={formData.price || 0} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} /></td>
                                    <td><span style={{ color: '#8B7E74' }}>{calculateMargin(formData.unitCost || 0, formData.price || 0)}</span></td>
                                    <td>
                                        <button className="btn" onClick={handleAdd}><Check size={14} /></button>
                                        <button className="btn" onClick={() => setIsAdding(false)}><X size={14} /></button>
                                    </td>
                                </tr>
                            )}
                            {data.map((item, idx) => (
                                <tr key={idx}>
                                    {editingItem === item.item ? (
                                        <>
                                            <td><input type="text" value={formData.item || ''} onChange={e => setFormData({ ...formData, item: e.target.value })} /></td>
                                            <td><input type="number" value={formData.unitCost || 0} onChange={e => setFormData({ ...formData, unitCost: parseInt(e.target.value) || 0 })} /></td>
                                            <td><input type="number" value={formData.price || 0} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} /></td>
                                            <td>{calculateMargin(formData.unitCost || 0, formData.price || 0)}</td>
                                            <td>
                                                <button className="btn" onClick={() => handleSave(item.item)}><Check size={14} /></button>
                                                <button className="btn" onClick={() => setEditingItem(null)}><X size={14} /></button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{item.item}</td>
                                            <td>${item.unitCost}</td>
                                            <td>${item.price}</td>
                                            <td>
                                                <span style={{
                                                    color: parseFloat(item.margin) < 20 ? '#B22222' : '#8B7E74',
                                                    fontWeight: '500'
                                                }}>
                                                    {item.margin}
                                                </span>
                                            </td>
                                            <td style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn" onClick={() => handleEdit(item)}><Edit2 size={14} /></button>
                                                <button className="btn" onClick={() => handleDelete(item.item)}><Trash2 size={14} /></button>
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

export default PricingManager;
