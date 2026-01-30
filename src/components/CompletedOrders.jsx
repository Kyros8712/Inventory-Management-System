import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, DollarSign, TrendingUp, Percent } from 'lucide-react';

const CompletedOrders = ({ data, loading }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Filter logic
    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter(order => {
            const orderDateStr = order.date.substring(0, 10); // "YYYY-MM-DD"
            if (startDate && orderDateStr < startDate) return false;
            // endDate should be inclusive, logic depends on format. 
            // If endDate is YYYY-MM-DD, strict comparison is fine if orderDate is same format.
            if (endDate && orderDateStr > endDate) return false;
            return true;
        });
    }, [data, startDate, endDate]);

    // Statistics Calculation
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let totalProfit = 0;

        filteredData.forEach(order => {
            totalRevenue += parseFloat(order.totalPrice) || 0;
            totalProfit += parseFloat(order.profit) || 0;
        });

        const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        return {
            revenue: totalRevenue.toFixed(0),
            profit: totalProfit.toFixed(0),
            margin: margin.toFixed(1) + '%'
        };
    }, [filteredData]);

    return (
        <div className="fade-in">
            <h2>完成訂單 & 營收分析</h2>

            {/* Controls */}
            <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label>開始日期:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label>結束日期:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <button
                        className="btn"
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                        style={{ fontSize: '0.9em' }}
                    >
                        清除篩選
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <StatCard
                    title="區間營業額"
                    value={`$${stats.revenue}`}
                    icon={<DollarSign size={24} color="#666" />}
                    color="#4dabf7"
                />
                <StatCard
                    title="區間利潤"
                    value={`$${stats.profit}`}
                    icon={<TrendingUp size={24} color="#666" />}
                    color="#51cf66"
                />
                <StatCard
                    title="區間毛利率"
                    value={stats.margin}
                    icon={<Percent size={24} color="#666" />}
                    color="#ff922b"
                />
            </div>

            {/* Table */}
            <div className="card">
                {loading ? <p>載入中...</p> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>訂單編號</th>
                                    <th style={{ padding: '12px' }}>完成日期</th>
                                    <th style={{ padding: '12px' }}>總金額</th>
                                    <th style={{ padding: '12px' }}>利潤</th>
                                    <th style={{ padding: '12px' }}>毛利率</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                                            {data && data.length > 0 ? '此區間無資料' : '目前無完成訂單'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((order, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '12px', fontSize: '0.85em', color: '#666' }}>{order.id}</td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Calendar size={14} color="#888" />
                                                    {order.date}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>${order.totalPrice}</td>
                                            <td style={{ padding: '12px', color: '#2b8a3e' }}>${order.profit}</td>
                                            <td style={{ padding: '12px', color: '#e67700' }}>{order.margin}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        borderTop: `4px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    }}>
        <div>
            <div style={{ color: '#888', fontSize: '0.9em', marginBottom: '5px' }}>{title}</div>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#333' }}>{value}</div>
        </div>
        <div style={{
            background: `${color}20`,
            padding: '10px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {React.cloneElement(icon, { color: color })}
        </div>
    </div>
);

export default CompletedOrders;
