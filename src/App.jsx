import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import OrderForm from './components/OrderForm';
import OrderManager from './components/OrderManager';
import CompletedOrders from './components/CompletedOrders';
import LoginPage from './components/LoginPage';
import { api } from './utils/api';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(api.isLoggedIn());
    const [view, setView] = useState('landing');
    const [inventory, setInventory] = useState([]);
    const [costs, setCosts] = useState([]);
    const [pricings, setPricings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // 從 GAS 獲取數據
    const fetchData = async () => {
        setLoading(true);
        try {
            // 使用封裝的 API 方法 (會自動帶入 apiKey)
            const data = await api.fetchData();

            setInventory(data.inventory || []);
            setCosts(data.costs || []);
            setPricings(data.pricings || []);
            setOrders(data.orders || []);
            setCompletedOrders(data.completedOrders || []);
        } catch (error) {
            console.error('Fetch error:', error);
            if (error.message === 'Invalid API Key') {
                alert('登入已失效，請重新登入');
                api.logout();
                setIsAuthenticated(false);
                return;
            }
            // Mock data - Ensure consistency
            const mockItems = ['麻製品收納盒', '不鏽鋼杯', '香氛噴霧'];
            setInventory(mockItems.map((item, i) => ({
                item,
                totalStock: [15, 8, 20][i],
                preOrderStock: [0, 2, 0][i],
                availableStock: [15, 6, 20][i]
            })));
            setCosts([
                { id: 1, date: '2024-01-20', item: '不鏽鋼杯', quantity: 10, unitPrice: 100, totalPrice: 1000 },
                { id: 2, date: '2024-01-21', item: '麻製品收納盒', quantity: 20, unitPrice: 150, totalPrice: 3000 }
            ]);
            setPricings([
                { item: '不鏽鋼杯', unitCost: 100, price: 250, margin: '60.0%' },
                { item: '麻製品收納盒', unitCost: 150, price: 300, margin: '50.0%' }
            ]);
            setOrders([
                {
                    id: 'ORD-TEMP-001',
                    date: '2024-01-28',
                    details: '不鏽鋼杯 x 2',
                    totalPrice: 500,
                    profit: 300,
                    margin: '60.0%',
                    customerName: '測試人員',
                    customerPhone: '0912345678',
                    storeId: '112233'
                }
            ]);
            setCompletedOrders([
                { id: 'ORD-DONE-001', date: '2024-01-25', totalPrice: 1000, profit: 400, margin: '40.0%' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && view !== 'landing') {
            fetchData();
        }
    }, [view, isAuthenticated]);

    if (!isAuthenticated) {
        return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="App">
            {view === 'landing' && <LandingPage onStart={() => setView('dashboard')} />}

            {view !== 'landing' && (
                <div className="container fade-in">
                    <nav style={{ marginBottom: '40px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className={`btn ${view === 'dashboard' ? 'btn-primary' : ''}`} onClick={() => setView('dashboard')}>庫存概覽</button>
                        <button className={`btn ${view === 'order' ? 'btn-primary' : ''}`} onClick={() => setView('order')}>建立訂單</button>
                        <button className={`btn ${view === 'order-list' ? 'btn-primary' : ''}`} onClick={() => setView('order-list')}>訂單管理</button>
                        <button className={`btn ${view === 'completed-orders' ? 'btn-primary' : ''}`} onClick={() => setView('completed-orders')}>營收分析 (完成訂單)</button>
                    </nav>

                    {view === 'dashboard' && (
                        <Dashboard
                            inventory={inventory}
                            orders={orders}
                            completedOrders={completedOrders}
                            loading={loading}
                            refresh={fetchData}
                        />
                    )}
                    {view === 'order' && <OrderForm inventory={inventory} onComplete={() => setView('dashboard')} />}
                    {view === 'order-list' && <OrderManager data={orders} loading={loading} refresh={fetchData} />}
                    {view === 'completed-orders' && <CompletedOrders data={completedOrders} loading={loading} />}
                </div>
            )}
        </div>
    );
}

export default App;
