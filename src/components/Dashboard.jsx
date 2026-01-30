import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { api } from '../utils/api';

const Dashboard = ({ inventory, loading, refresh }) => {
    const [editingItem, setEditingItem] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [addRows, setAddRows] = useState([
        { item: '', totalStock: 0, unitCost: 0, price: 0 }
    ]);
    const [formData, setFormData] = useState({
        item: '',
        totalStock: 0,
        unitCost: 0,
        price: 0
    });

    const calculateMargin = (cost, price) => {
        if (!price || price === 0) return '0.0%';
        const margin = ((price - cost) / price) * 100;
        return margin.toFixed(1) + '%';
    };

    const handleEdit = (item) => {
        setEditingItem(item.item);
        setFormData({
            item: item.item,
            totalStock: item.totalStock || item.stock || 0,
            unitCost: item.unitCost || 0,
            price: item.price || 0
        });
    };

    const handleSave = async () => {
        try {
            await api.post('updateInventoryItem', {
                originalItem: editingItem,
                ...formData
            });
            setEditingItem(null);
            refresh();
        } catch (e) {
            alert('更新失敗，請確認後端連結。');
            setEditingItem(null);
            refresh();
        }
    };

    const handleAddRow = () => {
        setAddRows([...addRows, { item: '', totalStock: 0, unitCost: 0, price: 0 }]);
    };

    const handleRemoveRow = (index) => {
        if (addRows.length === 1) return;
        setAddRows(addRows.filter((_, i) => i !== index));
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...addRows];
        newRows[index] = { ...newRows[index], [field]: value };
        setAddRows(newRows);
    };

    const handleAdd = async () => {
        const validRows = addRows.filter(row => row.item.trim() !== '');
        if (validRows.length === 0) {
            alert('請至少輸入一個品項名稱');
            return;
        }

        try {
            console.log('Sending bulk add request:', validRows);
            await api.post('bulkAddInventoryItems', { items: validRows });

            alert(`成功新增 ${validRows.length} 項商品！`);
            setIsAdding(false);
            setAddRows([{ item: '', totalStock: 0, unitCost: 0, price: 0 }]);
            refresh();
        } catch (e) {
            console.error('Bulk Add error:', e);
            alert('新增失敗，請確認後端連結。錯誤: ' + e.message);
            refresh();
        }
    };

    const handleDelete = async (itemName) => {
        // 第一次確認
        const firstConfirm = confirm(
            `⚠️ 警告：刪除商品\n\n` +
            `您即將刪除商品：「${itemName}」\n\n` +
            `此操作將會：\n` +
            `• 從庫存中移除此商品\n` +
            `• 刪除相關的定價記錄\n` +
            `• 保留歷史成本記錄\n\n` +
            `確定要繼續嗎？`
        );

        if (!firstConfirm) return;

        // 第二次確認（更嚴格）
        const secondConfirm = confirm(
            `🔴 最後確認\n\n` +
            `請再次確認您要刪除「${itemName}」\n\n` +
            `此操作無法復原！\n\n` +
            `確定要刪除嗎？`
        );

        if (!secondConfirm) {
            alert('已取消刪除操作');
            return;
        }

        try {
            console.log('Deleting item:', itemName);
            await api.post('deleteInventoryItem', { item: itemName });

            alert(`✅ 已成功刪除「${itemName}」`);
            refresh();
        } catch (e) {
            console.error('Delete error:', e);
            alert('❌ 刪除失敗，請確認後端連結。錯誤: ' + e.message);
            refresh();
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>庫存即時狀態</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={16} /> 新增商品
                    </button>
                    <button className="btn" onClick={refresh} disabled={loading}>
                        <RefreshCw size={16} /> 刷新數據
                    </button>
                </div>
            </div>

            <div className="card">
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '40px' }}>載入中...</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>品項</th>
                                <th>庫存量</th>
                                <th>訂單預售</th>
                                <th>剩餘庫存</th>
                                <th>進貨單價</th>
                                <th>品項定價</th>
                                <th>毛利率</th>
                                <th>狀態</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isAdding && (
                                <>
                                    {addRows.map((row, index) => (
                                        <tr key={`add-${index}`} style={{ backgroundColor: '#F7F5F2' }}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.item}
                                                    onChange={e => handleRowChange(index, 'item', e.target.value)}
                                                    placeholder="品項名稱"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={row.totalStock}
                                                    onChange={e => handleRowChange(index, 'totalStock', parseInt(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td>0</td>
                                            <td>{row.totalStock}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={row.unitCost}
                                                    onChange={e => handleRowChange(index, 'unitCost', parseInt(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={row.price}
                                                    onChange={e => handleRowChange(index, 'price', parseInt(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td>{calculateMargin(row.unitCost, row.price)}</td>
                                            <td>-</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    {index === addRows.length - 1 && (
                                                        <button className="btn" onClick={handleAddRow} title="新增一列">
                                                            <Plus size={14} />
                                                        </button>
                                                    )}
                                                    {addRows.length > 1 && (
                                                        <button className="btn" onClick={() => handleRemoveRow(index)} title="移除此列">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr style={{ backgroundColor: '#F7F5F2' }}>
                                        <td colSpan="8"></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn btn-primary" onClick={handleAdd} style={{ padding: '4px 12px' }}>
                                                    <Check size={14} /> 全部儲存
                                                </button>
                                                <button className="btn" onClick={() => {
                                                    setIsAdding(false);
                                                    setAddRows([{ item: '', totalStock: 0, unitCost: 0, price: 0 }]);
                                                }}>
                                                    <X size={14} color="#B22222" /> 取消
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </>
                            )}
                            {inventory.map((item, index) => (
                                editingItem === item.item ? (
                                    <tr key={index} style={{ backgroundColor: '#F7F5F2' }}>
                                        <td>{item.item}</td>
                                        <td><input type="number" value={formData.totalStock} onChange={e => setFormData({ ...formData, totalStock: parseInt(e.target.value) || 0 })} /></td>
                                        <td>{item.preOrderStock || 0}</td>
                                        <td>{formData.totalStock - (item.preOrderStock || 0)}</td>
                                        <td><input type="number" value={formData.unitCost} onChange={e => setFormData({ ...formData, unitCost: parseInt(e.target.value) || 0 })} /></td>
                                        <td><input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} /></td>
                                        <td>{calculateMargin(formData.unitCost, formData.price)}</td>
                                        <td>-</td>
                                        <td>
                                            <button className="btn" onClick={handleSave}><Check size={14} /></button>
                                            <button className="btn" onClick={() => setEditingItem(null)}><X size={14} /></button>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={index}>
                                        <td>{item.item}</td>
                                        <td>{item.totalStock || item.stock}</td>
                                        <td>{item.preOrderStock || 0}</td>
                                        <td>{item.availableStock !== undefined ? item.availableStock : (item.stock || item.totalStock)}</td>
                                        <td>${item.unitCost || 0}</td>
                                        <td>${item.price || 0}</td>
                                        <td style={{ color: parseFloat(item.margin) < 20 ? '#B22222' : '#333' }}>
                                            {item.margin || calculateMargin(item.unitCost || 0, item.price || 0)}
                                        </td>
                                        <td>
                                            {(item.availableStock !== undefined ? item.availableStock : item.stock) <= 5 ? (
                                                <span style={{ color: '#B22222', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <AlertTriangle size={14} /> 低庫存
                                                </span>
                                            ) : (
                                                <span style={{ color: '#8B7E74' }}>正常</span>
                                            )}
                                        </td>
                                        <td>
                                            <button className="btn" onClick={() => handleEdit(item)}><Edit2 size={14} /></button>
                                            <button className="btn" onClick={() => handleDelete(item.item)}><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
