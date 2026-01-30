import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { api } from '../utils/api';

const CategoryManager = ({ categories, inventory, onClose, onRefresh }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ mainCategory: '', subCategory: '' });

    // 計算每個類別下的商品數量
    const getCategoryCount = (main, sub) => {
        const categoryStr = main + (sub ? ' > ' + sub : '');
        return inventory.filter(item => item.category === categoryStr).length;
    };

    // 將類別數據轉換為樹狀結構
    const categoryTree = {};
    categories.forEach(cat => {
        if (!categoryTree[cat.mainCategory]) {
            categoryTree[cat.mainCategory] = [];
        }
        if (cat.subCategory) {
            categoryTree[cat.mainCategory].push(cat.subCategory);
        }
    });

    const handleAdd = async () => {
        if (!formData.mainCategory.trim()) {
            alert('請輸入主類別名稱');
            return;
        }

        try {
            await api.post('addCategory', formData);
            alert('✅ 類別新增成功');
            setIsAdding(false);
            setFormData({ mainCategory: '', subCategory: '' });
            onRefresh();
        } catch (e) {
            alert('❌ 新增失敗：' + e.message);
        }
    };

    const handleEdit = (main, sub) => {
        setEditingCategory({ oldMain: main, oldSub: sub });
        setFormData({ newMain: main, newSub: sub });
    };

    const handleUpdate = async () => {
        try {
            await api.post('updateCategory', { ...editingCategory, ...formData });
            alert('✅ 類別更新成功');
            setEditingCategory(null);
            onRefresh();
        } catch (e) {
            alert('❌ 更新失敗：' + e.message);
        }
    };

    const handleDelete = async (main, sub) => {
        const count = getCategoryCount(main, sub);
        if (count > 0) {
            alert(`❌ 無法刪除：有 ${count} 個商品使用此類別`);
            return;
        }

        if (!confirm(`確定要刪除「${main}${sub ? ' > ' + sub : ''}」嗎？`)) return;

        try {
            await api.post('deleteCategory', { mainCategory: main, subCategory: sub });
            alert('✅ 類別刪除成功');
            onRefresh();
        } catch (e) {
            alert('❌ 刪除失敗：' + e.message);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '30px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>類別管理</h2>
                    <button className="btn" onClick={onClose}><X size={20} /></button>
                </div>

                {/* 新增類別表單 */}
                {isAdding && (
                    <div style={{ backgroundColor: '#F7F5F2', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>主類別 *</label>
                            <input
                                type="text"
                                value={formData.mainCategory}
                                onChange={e => setFormData({ ...formData, mainCategory: e.target.value })}
                                placeholder="例如：餐廚用品"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>子類別（可選）</label>
                            <input
                                type="text"
                                value={formData.subCategory}
                                onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                                placeholder="例如：杯具"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-primary" onClick={handleAdd}><Check size={14} /> 儲存</button>
                            <button className="btn" onClick={() => {
                                setIsAdding(false);
                                setFormData({ mainCategory: '', subCategory: '' });
                            }}><X size={14} /> 取消</button>
                        </div>
                    </div>
                )}

                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)} style={{ marginBottom: '20px' }}>
                        <Plus size={16} /> 新增類別
                    </button>
                )}

                {/* 類別樹狀列表 */}
                <div>
                    {Object.keys(categoryTree).map(mainCat => (
                        <div key={mainCat} style={{ marginBottom: '20px', borderLeft: '3px solid #D1C7BD', paddingLeft: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div>
                                    <strong style={{ fontSize: '16px' }}>{mainCat}</strong>
                                    <span style={{ marginLeft: '10px', fontSize: '12px', color: '#8B7E74' }}>
                                        ({getCategoryCount(mainCat, '')} 個商品)
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button className="btn" onClick={() => handleEdit(mainCat, '')} title="編輯">
                                        <Edit2 size={14} />
                                    </button>
                                    <button className="btn" onClick={() => handleDelete(mainCat, '')} title="刪除">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* 子類別 */}
                            {categoryTree[mainCat].length > 0 && (
                                <div style={{ marginLeft: '20px' }}>
                                    {categoryTree[mainCat].map(subCat => (
                                        <div key={subCat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F2EEE9' }}>
                                            <div>
                                                <span style={{ fontSize: '14px' }}>└ {subCat}</span>
                                                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#8B7E74' }}>
                                                    ({getCategoryCount(mainCat, subCat)} 個商品)
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button className="btn" onClick={() => handleEdit(mainCat, subCat)} title="編輯">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button className="btn" onClick={() => handleDelete(mainCat, subCat)} title="刪除">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8B7E74' }}>
                        尚無類別，請新增第一個類別
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryManager;
