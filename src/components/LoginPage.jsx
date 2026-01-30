import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

const LoginPage = ({ onLogin }) => {
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (key.trim().length === 0) {
            setError('請輸入金鑰');
            setLoading(false);
            return;
        }

        // 1. Save locally first
        api.login(key.trim());

        // 2. Try to fetch data to validate
        try {
            // We'll trust the api.fetchData() to throw if key is invalid
            await onLogin(); // Let App.jsx handle the fetch logic and on-success
        } catch (err) {
            // Note: If App.jsx fetch fails, it might be due to Network OR Key.
            // We assume App.jsx will propagate error or we handle it here if onLogin is async
            console.error(err);
            // setError('驗證失敗，請檢查金鑰是否正確');
            // Actually, we should probably handle validation inside this component for better UX
            // But App.jsx is the one calling fetchData.
        }
        // If onLogin is just state switch, verification happens inside App.
        // Let's make this component verify first.
    };

    // Better Approach: Verify Here
    const verifyAndLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Save tmp
        api.login(key.trim());

        try {
            // Attempt a real fetch. Using api.fetchData()
            await api.fetchData();
            // If success, call onLogin to switch view
            onLogin();
        } catch (err) {
            console.error(err);
            if (err.message === 'Invalid API Key') {
                setError('❌ 金鑰錯誤');
            } else {
                setError('⚠️ 連線失敗，請檢查網路或確認後端已部署');
            }
            api.logout(); // Clear bad key
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            flexDirection: 'column'
        }}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        background: '#333',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px auto'
                    }}>
                        <Lock color="white" size={30} />
                    </div>
                    <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>系統鎖定</h2>
                    <p style={{ color: '#666' }}>請輸入 API Key 以解鎖系統</p>
                </div>

                <form onSubmit={verifyAndLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="輸入存取金鑰..."
                            style={{
                                width: '100%',
                                padding: '15px',
                                fontSize: '1.1em',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                outline: 'none'
                            }}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: '#d63384',
                            marginBottom: '20px',
                            textAlign: 'center',
                            fontSize: '0.9em',
                            padding: '10px',
                            background: '#fff0f6',
                            borderRadius: '6px'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '15px', fontSize: '1.1em', justifyContent: 'center' }}
                    >
                        {loading ? '驗證中...' : <><span style={{ marginRight: '8px' }}>解鎖</span> <ArrowRight size={18} /></>}
                    </button>
                </form>
            </div>
            <div style={{ marginTop: '20px', color: '#999', fontSize: '0.85em' }}>
                Inventory Management System &copy; 2024
            </div>
        </div>
    );
};

export default LoginPage;
