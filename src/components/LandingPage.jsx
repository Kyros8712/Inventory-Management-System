import React from 'react';
import { Package } from 'lucide-react';

const LandingPage = ({ onStart }) => {
    return (
        <div className="landing-container" style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #F7F5F2 0%, #E8E4E0 100%)'
        }}>
            <div className="fade-in">
                <Package size={64} color="#8B7E74" style={{ marginBottom: '24px' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: '300', color: '#333' }}>庫存管理系統</h1>
                <p style={{ color: '#757575', marginBottom: '40px', letterSpacing: '0.1em' }}>MINIMALIST INVENTORY MANAGEMENT</p>
                <button className="btn btn-primary" onClick={onStart} style={{ padding: '16px 48px', fontSize: '18px' }}>
                    開始使用
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
