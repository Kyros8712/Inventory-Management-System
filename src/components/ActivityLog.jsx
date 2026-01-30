import React from 'react';

const ActivityLog = ({ logs, loading }) => {
    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>操作紀錄 (最新 100 筆)</h2>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>讀取中...</div>
                ) : logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8B7E74' }}>暫無操作紀錄</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #E1D9D1', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>時間</th>
                                <th style={{ padding: '12px' }}>動作</th>
                                <th style={{ padding: '12px' }}>詳細資訊</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #F2EEE9' }}>
                                    <td style={{ padding: '12px', fontSize: '13px', color: '#8B7E74' }}>{log.time}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: getActionColor(log.action),
                                            fontSize: '12px',
                                            color: '#fff'
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const getActionColor = (action) => {
    if (action.includes('新增')) return '#8B7E74'; // 咖啡色 (Muji)
    if (action.includes('刪除')) return '#B22222'; // 紅色
    if (action.includes('更新') || action.includes('定價')) return '#D1C7BD'; // 淺咖
    if (action.includes('建立訂單')) return '#556B2F'; // 深綠
    if (action.includes('完成訂單')) return '#4682B4'; // 鋼青
    return '#A9A9A9';
};

export default ActivityLog;
