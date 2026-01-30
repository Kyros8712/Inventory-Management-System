import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import OrderForm from './components/OrderForm';
import OrderManager from './components/OrderManager';
import CompletedOrders from './components/CompletedOrders';
import ActivityLog from './components/ActivityLog';
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
    const [activityLogs, setActivityLogs] = useState([]);
    const [categories, setCategories] = useState([]);
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
            setActivityLogs(data.activityLogs || []);
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Fetch error:', error);
            if (error.message === 'Invalid API Key') {
                alert('登入已失效，請重新登入');
                api.logout();
                setIsAuthenticated(false);
                return;
            }
            // Removed mock data generation as per instruction to simplify catch logic
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
                        <button className={`btn ${view === 'completed-orders' ? 'btn-primary' : ''}`} onClick={() => setView('completed-orders')}>營收分析</button>
                        <button className={`btn ${view === 'activity-log' ? 'btn-primary' : ''}`} onClick={() => setView('activity-log')}>操作紀錄</button>
                    </nav>

                    {view === 'dashboard' && (
                        <Dashboard
                            inventory={inventory}
                            orders={orders}
                            completedOrders={completedOrders}
                            categories={categories}
                            loading={loading}
                            refresh={fetchData}
                        />
                    )}
                    {view === 'order' && <OrderForm inventory={inventory} onComplete={() => setView('dashboard')} />}
                    {view === 'order-list' && <OrderManager data={orders} loading={loading} refresh={fetchData} />}
                    {view === 'completed-orders' && <CompletedOrders data={completedOrders} loading={loading} />}
                    {view === 'activity-log' && <ActivityLog logs={activityLogs} loading={loading} />}
                </div>
            )}
        </div>
    );
}

export default App;
