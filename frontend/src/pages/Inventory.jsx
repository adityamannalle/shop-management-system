import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { formatCurrency } from '../utils';
import { FaPlus, FaEdit, FaTrash, FaBox, FaSearch, FaHdd, FaExclamationTriangle, FaTimes, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', low_stock_limit: 10 });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await api.get('/products');
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ 
                name: product.name, 
                description: product.description || '', 
                price: product.price, 
                stock: product.stock,
                low_stock_limit: product.low_stock_limit || 10
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', stock: '', low_stock_limit: 10 });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, formData);
                toast.success('Product updated');
            } else {
                await api.post('/products', formData);
                toast.success('Product added');
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            console.error("Submit error:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product permanently?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product removed');
            fetchProducts();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const midIndex = Math.ceil(filteredProducts.length / 2);
    const leftProducts = filteredProducts.slice(0, midIndex);
    const rightProducts = filteredProducts.slice(midIndex);

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    const renderTable = (productsList, startIndex = 0) => (
        <table className="pro-table compact">
            <thead>
                <tr>
                    <th style={{ width: '60px' }} className="text-center">SL No.</th>
                    <th>Product Name</th>
                    <th style={{ width: '100px' }} className="text-right">Price</th>
                    <th style={{ width: '80px' }} className="text-center">Stock</th>
                    <th style={{ width: '80px' }} className="text-center no-print">Actions</th>
                </tr>
            </thead>
            <tbody>
                {productsList.map((p, index) => (
                    <tr key={p.id}>
                        <td className="text-center text-slate-400 font-bold">{startIndex + index + 1}</td>
                        <td>
                            <div className="product-name-cell" title={p.name}>{p.name}</div>
                        </td>
                        <td className="text-right font-extrabold text-indigo-600">{formatCurrency(p.price)}</td>
                        <td className="text-center">
                            <span className={`stock-badge-mini ${p.stock < (p.low_stock_limit || 10) ? 'low' : ''}`}>
                                {p.stock}
                            </span>
                        </td>
                        <td className="text-center no-print">
                            <div className="action-row-compact">
                                <button onClick={() => handleOpenModal(p)} className="edit-btn-mini" title="Edit"><FaEdit /></button>
                                <button onClick={() => handleDelete(p.id)} className="del-btn-mini" title="Delete"><FaTrash /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="inventory-page-wrapper">
            {/* 1. WEB HEADER (Screen Only) */}
            <div className="inventory-header no-print">
                <div>
                    <h1>Inventory Control</h1>
                    <p>Manage and track your product stock levels</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => window.print()} className="btn-secondary-custom">
                        <FaPrint /> Print
                    </button>
                    <button onClick={() => handleOpenModal()} className="btn-primary-custom">
                        <FaPlus /> New Product
                    </button>
                </div>
            </div>

            {/* 2. PRINT HEADER (Centered Shop Name) */}
            <div className="only-print text-center mb-10">
                <h1 className="print-shop-name">Aditya Retail Shop</h1>
                <h2 className="print-subtitle">Stock Inventory Report</h2>
            </div>

            {/* 3. WEB SUMMARY (Top - Screen Only) */}
            <div className="inventory-stats-grid no-print mb-8">
                <div className="small-stat-card">
                    <div className="card-icon-box indigo"><FaBox /></div>
                    <div className="card-info">
                        <span className="card-label">Total Items</span>
                        <h2 className="card-value">{products.length}</h2>
                    </div>
                </div>
                <div className="small-stat-card">
                    <div className="card-icon-box amber"><FaExclamationTriangle /></div>
                    <div className="card-info">
                        <span className="card-label">Low Stock</span>
                        <h2 className="card-value text-danger">{products.filter(p => p.stock < (p.low_stock_limit || 10)).length}</h2>
                    </div>
                </div>
                <div className="small-stat-card">
                    <div className="card-icon-box emerald"><FaHdd /></div>
                    <div className="card-info">
                        <span className="card-label">Total Value</span>
                        <h2 className="card-value text-success">
                            {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.stock), 0))}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="table-card">
                <div className="table-header no-print">
                    <h3 className="font-bold">Inventory List</h3>
                    <div className="table-search">
                        <FaSearch />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="inventory-scroll-container">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12 text-muted italic">No products found.</div>
                    ) : (
                        <>
                            {/* SCREEN: TWO COLUMN GRID */}
                            <div className="inventory-grid-layout no-print">
                                <div className="inventory-col">
                                    {renderTable(leftProducts, 0)}
                                </div>
                                <div className="inventory-col">
                                    {renderTable(rightProducts, midIndex)}
                                </div>
                            </div>

                            {/* PRINT: SINGLE COLUMN EXCEL TABLE */}
                            <div className="only-print">
                                {renderTable(filteredProducts, 0)}

                                {/* PRINT SUMMARY AT BOTTOM */}
                                <div className="print-summary-row mt-10">
                                    <div className="print-stat">
                                        <span className="print-label">Total Items</span>
                                        <span className="print-value">{products.length}</span>
                                    </div>
                                    <div className="print-stat">
                                        <span className="print-label">Low Stock</span>
                                        <span className="print-value">{products.filter(p => p.stock < (p.low_stock_limit || 10)).length}</span>
                                    </div>
                                    <div className="print-stat">
                                        <span className="print-label">Total Value</span>
                                        <span className="print-value">
                                            {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.stock), 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay-custom">
                    <div className="modal-content-custom">
                        <div className="modal-head">
                            <h2 className="font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                            <button onClick={() => setShowModal(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-item">
                                <label>Product Name</label>
                                <input 
                                    required 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="form-item">
                                <label>Description</label>
                                <textarea 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-item">
                                    <label>Price</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={formData.price} 
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>
                                <div className="form-item">
                                    <label>Stock</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={formData.stock} 
                                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-item">
                                <label>Low Stock Limit</label>
                                <input 
                                    type="number" 
                                    required 
                                    value={formData.low_stock_limit} 
                                    onChange={(e) => setFormData({...formData, low_stock_limit: e.target.value})}
                                />
                                <span className="text-[10px] text-muted -mt-1">Notify when stock falls below this value</span>
                            </div>
                            <div className="modal-foot">
                                <button type="submit" className="save-btn">Save Product</button>
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .inventory-page-wrapper { width: 100%; animation: fadeIn 0.3s ease-out; }
                .only-print { display: none; }
                
                .inventory-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
                .inventory-header h1 { font-size: 26px; font-weight: 800; color: #1e293b; }
                .inventory-header p { font-size: 14px; color: #64748b; margin-top: 2px; }

                .inventory-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .small-stat-card {
                    background: #ffffff;
                    border-radius: 14px;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
                    border: 1px solid #f1f5f9;
                }

                .card-icon-box {
                    width: 40px; height: 40px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center; font-size: 18px;
                }
                .card-icon-box.indigo { background: #f5f3ff; color: #4f46e5; }
                .card-icon-box.amber { background: #fffbeb; color: #d97706; }
                .card-icon-box.emerald { background: #ecfdf5; color: #059669; }

                .card-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
                .card-value { font-size: 20px; font-weight: 800; color: #1e293b; }

                .inventory-scroll-container { max-height: 600px; overflow-y: auto; padding: 0 20px 20px 20px; }
                .inventory-grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

                .pro-table.compact { width: 100%; border-collapse: separate; border-spacing: 0; }
                .pro-table.compact th { 
                    position: sticky; top: 0; background: #f8fafc; z-index: 10;
                    padding: 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; 
                    border-bottom: 2px solid #e2e8f0;
                }
                .pro-table.compact td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                .product-name-cell { font-weight: 700; color: #1e293b; text-transform: uppercase; font-size: 13px; }

                .stock-badge-mini { background: #f8fafc; color: #1e293b; padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; border: 1px solid #e2e8f0; }
                .stock-badge-mini.low { background: #fff1f2; color: #e11d48; border-color: #fee2e2; }
                
                .action-row-compact { display: flex; gap: 6px; }
                .action-row-compact button { width: 28px; height: 28px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: 0.2s; }
                .edit-btn-mini { background: #f5f3ff; color: #4f46e5; }
                .del-btn-mini { background: #fef2f2; color: #dc2626; }

                .btn-primary-custom { background: var(--primary); color: white; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; display: flex; align-items: center; gap: 8px; }
                .btn-secondary-custom { background: white; color: #475569; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px; }

                .table-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; }
                .table-search { position: relative; }
                .table-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
                .table-search input { padding: 10px 12px 10px 40px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px; width: 220px; }

                @media print {
                    @page { margin: 1cm; size: portrait; }
                    .inventory-page-wrapper { margin: 0 !important; padding: 0 !important; background: white !important; }
                    .no-print { display: none !important; }
                    .only-print { display: block !important; }
                    
                    /* EXCEL HEADER */
                    .only-print { text-align: center !important; margin-bottom: 25pt !important; border-bottom: 2px solid #000 !important; padding-bottom: 15pt !important; }
                    .print-shop-name { font-size: 28pt !important; font-weight: 900 !important; margin: 0 !important; color: #000 !important; text-transform: uppercase !important; }
                    .print-subtitle { font-size: 14pt !important; color: #333 !important; margin-top: 5pt !important; text-transform: uppercase !important; letter-spacing: 3px !important; font-weight: 700 !important; }

                    .inventory-scroll-container { max-height: none !important; overflow: visible !important; padding: 0 !important; }
                    
                    /* EXCEL TABLE */
                    .pro-table.compact { 
                        width: 100% !important; 
                        border-collapse: collapse !important; 
                        border: 1.2pt solid #000 !important; 
                        margin-top: 20pt !important; 
                    }
                    .pro-table.compact th { 
                        background: #f3f4f6 !important; 
                        border: 1pt solid #000 !important; 
                        color: #000 !important; 
                        padding: 10pt 8pt !important; 
                        font-size: 10pt !important; 
                        position: static !important;
                        font-weight: 900 !important;
                        text-transform: uppercase !important;
                        text-align: center !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .pro-table.compact td { 
                        border: 0.8pt solid #000 !important; 
                        padding: 8pt 10pt !important; 
                        font-size: 10pt !important; 
                        color: #000 !important; 
                        text-align: center !important;
                    }
                    .pro-table.compact tr:nth-child(even) { background: #f9fafb !important; -webkit-print-color-adjust: exact; }

                    /* EXCEL SUMMARY ROW (BOTTOM) */
                    .print-summary-row { 
                        display: flex !important; 
                        border: 1.2pt solid #000 !important; 
                        width: 100% !important; 
                        margin-top: 30pt !important; 
                    }
                    .print-stat { 
                        flex: 1 !important; 
                        display: flex !important; 
                        flex-direction: column !important; 
                        align-items: center !important; 
                        padding: 10pt !important; 
                        border-right: 1pt solid #000 !important; 
                    }
                    .print-stat:last-child { border-right: none !important; }
                    .print-label { font-size: 8pt !important; font-weight: bold !important; text-transform: uppercase !important; }
                    .print-value { font-size: 12pt !important; font-weight: 900 !important; margin-top: 4pt !important; }
                }

                /* Modals */
                .modal-overlay-custom { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(4px); }
                .modal-content-custom { background: white; width: 100%; max-width: 450px; border-radius: 20px; padding: 30px; }
                .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .modal-form { display: flex; flex-direction: column; gap: 15px; }
                .form-item { display: flex; flex-direction: column; gap: 5px; }
                .form-item input, .form-item textarea { padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .save-btn { background: var(--primary); color: white; padding: 12px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; }
                .cancel-btn { background: #f1f5f9; color: #64748b; padding: 12px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; }
            ` }} />
        </div>
    );
};

export default Inventory;
