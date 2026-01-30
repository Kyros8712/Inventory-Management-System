import React, { useState } from 'react';
import { Send, Plus, Trash2 } from 'lucide-react';
import { api } from '../utils/api';

const OrderForm = ({ inventory, onComplete }) => {
    const [customer, setCustomer] = useState({ name: '', phone: '', storeId: '' });
    const [items, setItems] = useState([{ item: '', quantity: 1 }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addItem = () => {
        setItems([...items, { item: '', quantity: 1 }]);
    };

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const getAvailableStock = (itemName) => {
        const item = inventory.find(inv => inv.item === itemName);
        return item ? (item.availableStock !== undefined ? item.availableStock : item.stock) : 0;
    };

    const calculateTotal = () => {
        return items.reduce((total, entry) => {
            const item = inventory.find(inv => inv.item === entry.item);
            const price = item ? (parseInt(item.price) || 0) : 0;
            return total + (price * entry.quantity);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 檢查庫存是否足夠
        for (const entry of items) {
            const stock = getAvailableStock(entry.item);
            if (entry.quantity > stock) {
                alert(`庫存不足！\n\n「${entry.item}」剩餘庫存: ${stock}\n您輸入的數量: ${entry.quantity}`);
                setIsSubmitting(false);
                return;
            }
        }

        // 計算總金額並準備確認訊息
        const total = calculateTotal();
        const details = items.map(entry => {
            const item = inventory.find(inv => inv.item === entry.item);
            const price = item ? (parseInt(item.price) || 0) : 0;
            return `${entry.item} x ${entry.quantity} (單價: $${price}) = $${price * entry.quantity}`;
        }).join('\n');

        const confirmMessage = `請確認訂單內容：\n\n訂購人: ${customer.name}\n電話: ${customer.phone}\n7-11店號: ${customer.storeId}\n\n${details}\n\n--------------------------------\n訂單總金額: $${total}\n\n確定要提交嗎？`;

        if (!confirm(confirmMessage)) return;

        setIsSubmitting(true);

        try {
            console.log('Submitting order:', items);

            await api.post('createOrder', {
                customer: customer,
                details: items,
                totalPrice: total,
                date: new Date().toISOString()
            });

            alert('訂單已提交！');
            onComplete();
        } catch (error) {
            console.error('Submit error:', error);
            alert('提交失敗：' + error.message + '\n請檢查 Google Apps Script URL 是否設定正確。');
            onComplete(); // 模擬環境下仍回主頁
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fade-in">
            <h2>輸入訂單</h2>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    {/* Customer Info Section */}
                    <h3 style={{ fontSize: '1.1em', marginBottom: '15px', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>訂購人資訊</h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '25px' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label>訂購人姓名</label>
                            <input
                                type="text"
                                value={customer.name}
                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                required
                                placeholder="請輸入姓名"
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label>電話</label>
                            <input
                                type="tel"
                                value={customer.phone}
                                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                required
                                placeholder="09xxxxxxxx"
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label>7-11 店號</label>
                            <input
                                type="text"
                                value={customer.storeId}
                                onChange={(e) => setCustomer({ ...customer, storeId: e.target.value })}
                                required
                                placeholder="請輸入店號"
                            />
                        </div>
                    </div>

                    {/* Order Items Section */}
                    <h3 style={{ fontSize: '1.1em', marginBottom: '15px', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>訂購品項</h3>
                    {items.map((entry, index) => (
                        <div key={index} className="order-row" style={{
                            display: 'flex',
                            gap: '15px',
                            alignItems: 'flex-end',
                            marginBottom: '15px',
                            paddingBottom: '15px',
                            borderBottom: '1px solid #F0F0F0'
                        }}>
                            <div style={{ flex: 2 }}>
                                <label>選擇品項</label>
                                <select
                                    value={entry.item}
                                    onChange={(e) => updateItem(index, 'item', e.target.value)}
                                    required
                                >
                                    <option value="">-- 請選擇 --</option>
                                    {inventory.map((inv, i) => (
                                        <option key={i} value={inv.item}>
                                            {inv.item} (剩餘庫存: {inv.availableStock !== undefined ? inv.availableStock : inv.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>數量</label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
                                    max={getAvailableStock(entry.item)}
                                    value={entry.quantity || 0}
                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div>
                                <button type="button" className="btn" onClick={() => removeItem(index)} style={{ padding: '12px' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <button type="button" className="btn" onClick={addItem}>
                            <Plus size={16} /> 新增品項
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            <Send size={16} /> {isSubmitting ? '提交中...' : '提交訂單'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderForm;
