import React, { useState } from 'react';
import { Trash2, Calendar, ShoppingBag, CheckCircle, Package } from 'lucide-react';
import { api } from '../utils/api';

const OrderManager = ({ data, loading, refresh }) => {
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map(order => order.id));
        }
    };

    const handleDelete = async (id) => {
        // Find order by ID to get details for better confirm message is optional but good
        // Since we are moving to ID based, 'id' passed here is the Order ID string
        if (!confirm('確定要刪除這筆訂單嗎？刪除進行中的訂單將會還原預售庫存。')) return;
        try {
            await api.post('deleteOrders', { ids: [id] });
            refresh();
        } catch (e) {
            alert('刪除失敗，請確認後端連結。');
            refresh();
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`確定要刪除選取的 ${selectedIds.length} 筆訂單嗎？這些訂單的預售庫存將會還原。`)) return;

        try {
            await api.post('deleteOrders', { ids: selectedIds });
            setSelectedIds([]);
            refresh();
        } catch (e) {
            alert('批量刪除失敗，請確認後端連結。');
            refresh();
        }
    };

    const handleBulkComplete = async () => {
        if (selectedIds.length === 0) return;

        const msg = `✅ 批量完成確認\n\n即將完成選取的 ${selectedIds.length} 筆訂單。\n\n這將會：\n1. 扣除庫存\n2. 清除預售\n3. 移至「完成訂單」\n\n確定嗎？`;
        if (!confirm(msg)) return;

        try {
            await api.post('completeOrders', { ids: selectedIds });
            setSelectedIds([]);
            refresh();
        } catch (e) {
            alert('操作失敗，請確認後端連結。');
            refresh();
        }
    };

    const handleComplete = async (order) => {
        // Step 1 Confirm
        const msg1 = `✅ 確認完成訂單\n\n訂單編號: ${order.id}\n總金額: $${order.totalPrice}\n\n這將會：\n1. 從「庫存」中實際扣除商品數量\n2. 從「訂單預售」中移除\n3. 將訂單移動至「完成訂單」\n\n確定嗎？`;
        if (!confirm(msg1)) return;

        // Step 2 Confirm
        const msg2 = `⚠️ 最後確認\n\n訂單完成後將無法還原至進行中狀態。\n庫存將被永久扣除。\n\n確定要完成嗎？`;
        if (!confirm(msg2)) return;

        try {
            await api.post('completeOrder', { id: order.id });
            refresh();
        } catch (e) {
            alert('操作失敗，請確認後端連結。');
            refresh();
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>訂單管理 (進行中)</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {selectedIds.length > 0 && (
                        <>
                            <button className="btn" style={{ backgroundColor: '#2E8B57', color: 'white' }} onClick={handleBulkComplete}>
                                <CheckCircle size={16} /> 完成選取 ({selectedIds.length})
                            </button>
                            <button className="btn" style={{ backgroundColor: '#B22222', color: 'white' }} onClick={handleBulkDelete}>
                                <Trash2 size={16} /> 刪除選取 ({selectedIds.length})
                            </button>
                        </>
                    )}
                    <button className="btn" onClick={refresh} disabled={loading}>重新整理</button>
                </div>
            </div>

            <div className="card">
                {loading ? <p>載入中...</p> : (
                    <table className="order-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input type="checkbox" onChange={toggleSelectAll}
                                        checked={data.length > 0 && selectedIds.length === data.length} />
                                </th>
                                <th>訂單編號</th>
                                <th>日期</th>
                                <th>訂購人</th>
                                <th>品項明細</th>
                                <th>總額</th>
                                <th>利潤</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>目前無進行中的訂單</td>
                                </tr>
                            ) : (
                                data.map((order) => (
                                    <tr key={order.id} style={{ backgroundColor: selectedIds.includes(order.id) ? '#f9f9f9' : 'transparent' }}>
                                        <td>
                                            <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelect(order.id)} />
                                        </td>
                                        <td style={{ fontSize: '0.85em', color: '#666' }}>{order.id}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={14} color="#8B7E74" />
                                                {order.date}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.9em' }}>
                                            <div>{order.customerName || '-'}</div>
                                            <div style={{ color: '#888', fontSize: '0.85em' }}>{order.customerPhone}</div>
                                            <div style={{ color: '#888', fontSize: '0.85em' }}>{order.storeId && `店號: ${order.storeId}`}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ShoppingBag size={14} color="#8B7E74" />
                                                {order.details}
                                            </div>
                                        </td>
                                        <td>${order.totalPrice}</td>
                                        <td style={{ color: '#2E8B57' }}>${order.profit}<br /><span style={{ fontSize: '0.8em', color: '#888' }}>({order.margin})</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button className="btn" title="完成訂單" onClick={() => handleComplete(order)} style={{ color: '#2E8B57' }}>
                                                    <CheckCircle size={14} />
                                                </button>
                                                <button className="btn" title="刪除訂單" onClick={() => handleDelete(order.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OrderManager;
