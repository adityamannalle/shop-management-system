import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { formatCurrency, showToast } from '../utils';
import { FaSearch, FaShoppingCart, FaTrash, FaTimes, FaPrint, FaUser, FaBoxOpen } from 'react-icons/fa';
import Card from '../components/Card';
import InvoicePrint from '../components/InvoicePrint';

const Billing = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastBill, setLastBill] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [gstEnabled, setGstEnabled] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await api.get('/products');
            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.quantity >= product.stock) {
                showToast('Insufficient stock available', 'error');
                return;
            }
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            if (product.stock < 1) {
                showToast('Product is out of stock', 'error');
                return;
            }
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateQuantity = (id, newQty) => {
        const product = products.find(p => p.id === id);
        if (!product) return;
        if (newQty < 1) return;
        if (newQty > product.stock) {
            showToast(`Only ${product.stock} items available`, 'error');
            return;
        }
        setCart(cart.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    };

    const calculateSubtotal = () => {
        if (!cart || cart.length === 0) return 0;
        const total = cart.reduce((acc, item) => {
            const price = parseFloat(item.price) || 0;
            const qty = parseInt(item.quantity) || 0;
            return acc + (price * qty);
        }, 0);
        console.log("[Billing Debug] Calculated Subtotal:", total, "Cart:", cart);
        return total;
    };

    const calculateGST = () => {
        const sub = calculateSubtotal();
        return gstEnabled ? (sub * 0.18) : 0;
    };

    const calculateTotal = () => {
        const sub = calculateSubtotal();
        const gst = calculateGST();
        const total = sub + gst;
        console.log("[Billing Debug] Calculated Total:", total);
        return total;
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsLoading(true);
        try {
            const items = cart.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }));

            console.log("[Billing Debug] Sending checkout request:", items);

            const response = await api.post('/orders', {
                items: items,
                customerName: customerName || 'Walk-in Customer',
                paymentMode: paymentMode,
                gstAmount: gstEnabled ? 1 : 0
            });

            console.log("[Billing Debug] Checkout response:", response);

            // Get current user for Sold By info
            const currentUser = JSON.parse(localStorage.getItem('user'));

            const billData = {
                id: response.orderId,
                items: [...cart],
                subtotal: parseFloat(response.subtotal) || 0,
                gstAmount: parseFloat(response.gstAmount) || 0,
                netPayable: parseFloat(response.netPayable) || 0,
                payment_mode: response.payment_mode || paymentMode,
                customerName: customerName || 'Walk-in Customer',
                date: new Date().toLocaleString(),
                staffName: currentUser?.name || 'Admin'
            };

            console.log("[Billing Debug] Setting lastBill:", billData);

            setLastBill(billData);
            setCart([]);
            setCustomerName('');
            setPaymentMode('Cash');
            setGstEnabled(false);
            setShowInvoice(true);
            fetchProducts();
            showToast('Bill generated successfully', 'success');
        } catch (err) {
            console.error('[Billing Debug] Checkout error:', err);
            showToast('Checkout failed. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        console.log('[Print Debug] Current Bill Data:', lastBill);
        
        if (!lastBill || !lastBill.items || lastBill.items.length === 0) {
            showToast('Error: No invoice data found to print.', 'error');
            return;
        }

        // Add a small timeout to ensure DOM is updated
        setTimeout(() => {
            const printElement = document.getElementById('invoice-print');
            if (printElement) {
                window.print();
            } else {
                console.error('[Print Error] invoice-print element not found in DOM');
                showToast('Error: Printable section not found.', 'error');
            }
        }, 500);
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="billing-container">
            {/* Always render InvoicePrint but it's hidden by CSS when empty or on screen */}
            <InvoicePrint bill={lastBill} />

            <div className="billing-grid-layout no-print">
                {/* Catalog Card */}
                <div className="catalog-section">
                    <Card noPadding>
                        <div className="catalog-header">
                            <div className="search-box">
                                <FaSearch className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Search products by name or ID..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="product-list-scroll">
                            <div className="product-grid">
                                {filteredProducts.map(p => (
                                    <button 
                                        key={p.id} 
                                        onClick={() => addToCart(p)}
                                        disabled={p.stock < 1}
                                        className={`pos-product-card ${p.stock < 1 ? 'out-of-stock' : ''}`}
                                    >
                                        <div className="product-info">
                                            <span className="p-name">{p.name}</span>
                                            <span className="p-stock">Stock: {p.stock}</span>
                                        </div>
                                        <div className="p-price">{formatCurrency(p.price)}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Cart Side */}
                <div className="cart-section">
                    <Card title="Current Cart" icon={<FaShoppingCart />} noPadding>
                        <div className="cart-content">
                            <div className="cart-items-scroll">
                                {cart.length === 0 ? (
                                    <div className="empty-cart">
                                        <FaShoppingCart size={40} />
                                        <p>Your cart is empty</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div className="item-main">
                                                <span className="item-name">{item.name}</span>
                                                <span className="item-price">{formatCurrency(item.price)}</span>
                                            </div>
                                            <div className="item-controls">
                                                <div className="qty-picker">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                                </div>
                                                <button className="del-btn" onClick={() => removeFromCart(item.id)}>
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="checkout-footer">
                                <div className="customer-inputs">
                                    <div className="input-row">
                                        <FaUser className="row-icon" />
                                        <input 
                                            type="text" 
                                            placeholder="Customer Name" 
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                        />
                                    </div>
                                    <div className="input-row">
                                        <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                                            <option value="Cash">Cash Payment</option>
                                            <option value="Card">Card Payment</option>
                                            <option value="UPI">UPI Transfer</option>
                                        </select>
                                        <label className="gst-toggle">
                                            <input type="checkbox" checked={gstEnabled} onChange={(e) => setGstEnabled(e.target.checked)} />
                                            <span>GST</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="summary-section">
                                    <div className="summary-row">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(calculateSubtotal())}</span>
                                    </div>
                                    {gstEnabled && (
                                        <div className="summary-row">
                                            <span>GST (18%)</span>
                                            <span>{formatCurrency(calculateGST())}</span>
                                        </div>
                                    )}
                                    <div className="summary-row total">
                                        <span>Net Payable</span>
                                        <span>{formatCurrency(calculateTotal())}</span>
                                    </div>
                                </div>

                                <button 
                                    className="checkout-btn" 
                                    disabled={cart.length === 0 || isLoading}
                                    onClick={handleCheckout}
                                >
                                    {isLoading ? 'Processing...' : `Pay ${formatCurrency(calculateTotal())}`}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Success Modal Overlay */}
            {showInvoice && lastBill && (
                <div className="fixed-overlay no-print">
                    <div className="modal-inner">
                        <button className="close-x" onClick={() => setShowInvoice(false)}><FaTimes /></button>
                        <div className="success-badge-container">
                            <div className="success-icon-circle">✓</div>
                            <h2>Payment Received</h2>
                            <p>Invoice #INV-{lastBill.id} has been generated.</p>
                        </div>

                        {/* Modal Invoice Summary (Preview) */}
                        <div className="preview-invoice-table">
                            <table className="w-full mb-4 text-sm text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2">Item Name</th>
                                        <th className="py-2 text-center">Quantity</th>
                                        <th className="py-2 text-right">Price</th>
                                        <th className="py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lastBill.items.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-100">
                                            <td className="py-2">{item.name}</td>
                                            <td className="py-2 text-center">{item.quantity}</td>
                                            <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                                            <td className="py-2 text-right">{formatCurrency(parseFloat(item.price) * parseInt(item.quantity))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex justify-between font-bold text-lg mt-2">
                                <span>Net Payable:</span>
                                <span>{formatCurrency(lastBill.netPayable)}</span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="print-action-btn" onClick={handlePrint}>
                                <FaPrint /> Print Bill
                            </button>
                            <button className="close-action-btn" onClick={() => setShowInvoice(false)}>Done</button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .billing-grid-layout {
                    display: grid;
                    grid-template-columns: 1.6fr 1fr;
                    gap: 16px;
                    align-items: start;
                }
                @media (max-width: 1024px) {
                    .billing-grid-layout {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                }
                .catalog-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border);
                }
                .search-box {
                    position: relative;
                    width: 100%;
                }
                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
                .search-box input {
                    width: 100%;
                    padding: 10px 12px 10px 40px;
                    border-radius: var(--radius-std);
                    border: 1px solid var(--border);
                    background: var(--bg-body);
                    font-size: 14px;
                }
                .product-list-scroll {
                    max-height: 600px;
                    overflow-y: auto;
                    padding: 16px;
                }
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 12px;
                }
                .pos-product-card {
                    background: var(--white);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 12px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 90px;
                }
                .pos-product-card:hover:not(:disabled) {
                    border-color: var(--primary);
                    background: #f5f3ff;
                    transform: translateY(-2px);
                }
                .pos-product-card.out-of-stock {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: #f1f5f9;
                }
                .p-name { font-weight: 700; font-size: 13px; color: var(--text-dark); display: block; }
                .p-stock { font-size: 10px; color: var(--text-muted); }
                .p-price { font-weight: 800; color: var(--primary); margin-top: 6px; font-size: 14px; }

                .cart-content {
                    display: flex;
                    flex-direction: column;
                }
                .cart-items-scroll {
                    height: 240px;
                    overflow-y: auto;
                    padding: 0 16px;
                }
                .empty-cart {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 0;
                    color: #cbd5e1;
                    gap: 12px;
                }
                .cart-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                .item-name { font-weight: 600; font-size: 13px; display: block; }
                .item-price { font-size: 12px; color: var(--text-muted); }
                .item-controls { display: flex; align-items: center; gap: 10px; }
                .qty-picker { display: flex; align-items: center; background: #f1f5f9; border-radius: 8px; padding: 2px; }
                .qty-picker button { border: none; background: white; width: 22px; height: 22px; border-radius: 6px; cursor: pointer; font-weight: bold; }
                .qty-picker span { width: 26px; text-align: center; font-size: 12px; font-weight: 700; }
                .del-btn { border: none; background: transparent; color: #94a3b8; cursor: pointer; }
                .del-btn:hover { color: var(--danger); }

                .checkout-footer {
                    padding: 16px;
                    background: #f8fafc;
                    border-top: 1px solid var(--border);
                }
                .customer-inputs { margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; }
                .input-row { display: flex; gap: 8px; align-items: center; }
                .row-icon { color: #94a3b8; font-size: 14px; }
                .customer-inputs input, .customer-inputs select {
                    flex: 1;
                    padding: 8px 10px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    font-size: 13px;
                }
                .gst-toggle { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; cursor: pointer; }

                .summary-section { margin-bottom: 12px; }
                .summary-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 3px; }
                .summary-row.total { color: var(--text-dark); font-weight: 800; font-size: 17px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; }

                .checkout-btn {
                    width: 100%;
                    padding: 12px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-std);
                    font-weight: 800;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .checkout-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

                /* Success Modal */
                .fixed-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
                .modal-inner { background: white; width: 100%; max-width: 450px; border-radius: 20px; padding: 32px; position: relative; text-align: center; }
                .close-x { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; }
                
                .success-badge-container { margin-bottom: 24px; }
                .success-icon-circle { width: 60px; height: 60px; background: #ecfdf5; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 16px; border: 2px solid #10b981; }
                .success-badge-container h2 { font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
                .success-badge-container p { color: #64748b; font-size: 14px; }

                .modal-actions { display: flex; gap: 12px; margin-top: 32px; }
                .print-action-btn { flex: 2; padding: 14px; background: #111827; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .close-action-btn { flex: 1; padding: 14px; background: #f1f5f9; color: #64748b; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }
            `}} />
        </div>
    );
};

export default Billing;
