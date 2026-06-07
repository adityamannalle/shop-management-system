import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { showToast, formatCurrency } from '../utils';
import { FaCalendarAlt, FaUser, FaCreditCard, FaSearch, FaEye, FaFileInvoiceDollar, FaChartLine, FaShoppingBag, FaWallet, FaCheckCircle, FaFilter, FaTimes, FaPrint, FaQrcode } from 'react-icons/fa';
import Card from '../components/Card';
import InvoicePrint from '../components/InvoicePrint';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const SalesPerformance = () => {
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState([]);
    const [user, setUser] = useState(null);

    // Modal State
    const [selectedBill, setSelectedBill] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        staffId: '',
        paymentMode: '',
        search: ''
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
        fetchPerformance();
        if (storedUser?.role === 'admin') fetchStaff();
    }, []);

    const fetchPerformance = async (customFilters = filters) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(customFilters).toString();
            const data = await api.get(`/orders/performance?${queryParams}`);
            setPerformanceData(data);
        } catch (err) {
            showToast('Failed to load performance data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const data = await api.get('/auth/staff');
            setStaffList(data);
        } catch (err) {
            console.error('Failed to load staff list');
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => fetchPerformance();
    const clearFilters = () => {
        const reset = { startDate: '', endDate: '', staffId: '', paymentMode: '', search: '' };
        setFilters(reset);
        fetchPerformance(reset);
    };

    const handleViewBill = async (billId) => {
        setModalLoading(true);
        setShowModal(true);
        setSelectedBill(null);
        try {
            const fullBill = await api.get(`/orders/detail/${billId}`);
            if (!fullBill) throw new Error('Could not fetch details');
            setSelectedBill(fullBill);
        } catch (err) {
            showToast('Failed to load bill details', 'error');
            setShowModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handlePrintDirect = async (billId) => {
        try {
            const fullBill = await api.get(`/orders/detail/${billId}`);
            if (!fullBill) throw new Error('Could not fetch invoice details');
            
            setSelectedBill(fullBill);
            
            // Give React enough time to render the hidden InvoicePrint component
            setTimeout(() => {
                window.print();
            }, 700);
        } catch (err) {
            showToast('Failed to load bill for printing', 'error');
        }
    };

    const handlePrint = () => {
        if (!selectedBill) return;
        setTimeout(() => window.print(), 500);
    };

    const handlePrintTopProducts = () => {
        if (!charts?.topProducts || charts.topProducts.length === 0) {
            showToast('No top products data available', 'error');
            return;
        }

        // Create a hidden iframe for printing
        let iframe = document.getElementById('print-iframe-top-prod');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'print-iframe-top-prod';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }

        const date = new Date().toLocaleDateString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric'
        });

        const htmlContent = `
            <html>
                <head>
                    <title>Top Selling Products Report</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; }
                        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
                        .shop-name { font-size: 28px; font-weight: 900; margin: 0; text-transform: uppercase; }
                        .report-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 5px; }
                        .date { font-size: 11px; color: #000; margin-top: 8px; font-weight: 600; }
                        table { width: 100%; border-collapse: collapse; border: 1.2pt solid #000; margin-top: 20px; }
                        th { background: #f3f4f6 !important; color: #000; font-size: 10px; font-weight: 900; text-transform: uppercase; padding: 12px; text-align: center; border: 1pt solid #000; -webkit-print-color-adjust: exact; }
                        td { padding: 10px 12px; border: 0.8pt solid #000; font-size: 13px; color: #000; text-align: center; }
                        tr:nth-child(even) { background: #f9fafb !important; -webkit-print-color-adjust: exact; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .font-bold { font-weight: 900; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="shop-name">ADITYA RETAIL SHOP</h1>
                        <div class="report-title">Top Selling Products Report</div>
                        <div class="date">Generated: ${date}</div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 60px;" class="text-center">Rank</th>
                                <th>Product Name</th>
                                <th class="text-center">Units Sold</th>
                                <th class="text-right">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${charts.topProducts.map((prod, index) => `
                                <tr>
                                    <td class="text-center font-bold">${index + 1}</td>
                                    <td style="text-align: left;">${prod.name}</td>
                                    <td class="text-center">${prod.totalSold} Units</td>
                                    <td class="text-right font-bold">${formatCurrency(prod.revenue)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(htmlContent);
        iframe.contentWindow.document.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 500);
    };

    if (loading && !performanceData) {
        return <div className="flex-center" style={{ height: '400px' }}><div className="spinner-pro"></div></div>;
    }

    const { summary, bills, charts } = performanceData || {};

    const lineChartData = {
        labels: charts?.last7Days?.map(d => new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })) || [],
        datasets: [{
            label: 'Sales Revenue',
            data: charts?.last7Days?.map(d => d.amount) || [],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1'
        }]
    };

    const barChartData = {
        labels: charts?.monthlyTrend?.map(d => d.month) || [],
        datasets: [{
            label: 'Monthly Revenue',
            data: charts?.monthlyTrend?.map(d => d.amount) || [],
            backgroundColor: '#4f46e5',
            borderRadius: 6,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#f8fafc',
                bodyColor: '#f8fafc',
                padding: 12,
                borderRadius: 8,
                borderColor: '#1e293b',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8', font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 11 } }
            }
        }
    };

    return (
        <div className="performance-page">
            <InvoicePrint bill={selectedBill} />

            {/* PRINT ONLY HEADER */}
            <div className="only-print" style={{ textAlign: 'center', marginBottom: '20pt' }}>
                <h1 style={{ fontSize: '24pt', fontWeight: '900', margin: '0' }}>Aditya Retail Shop</h1>
                <h2 style={{ fontSize: '14pt', color: '#666', marginTop: '5pt', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {filters.staffId && staffList.find(s => s.id == filters.staffId) 
                        ? `Sales Report: ${staffList.find(s => s.id == filters.staffId).name}` 
                        : 'Sales Performance Report'}
                </h2>
                {filters.startDate && filters.endDate && (
                    <p style={{ fontSize: '10pt', marginTop: '5pt' }}>Period: {filters.startDate} to {filters.endDate}</p>
                )}
            </div>

            <div className="page-header-flex no-print">
                <div className="header-info">
                    <h1>Sales Performance</h1>
                    <p className="text-muted">Track and analyze store growth and revenue trends</p>
                </div>
                <div className="header-actions">
                    <button onClick={() => window.print()} className="btn-print-view">
                        <FaPrint /> Print
                    </button>
                </div>
            </div>

            {/* Summary Cards - Organized in 2 Rows */}
            <div className="stats-container no-print">
                {/* Row 1: High Level Metrics */}
                <div className="stats-row row-4-cols">
                    <div className="stat-card rev-card">
                        <div className="stat-icon rev"><FaFileInvoiceDollar /></div>
                        <div className="stat-data">
                            <span className="label">Total Revenue</span>
                            <h2 className="val">{formatCurrency(summary?.totalRevenue || 0)}</h2>
                        </div>
                    </div>
                    <div className="stat-card order-card">
                        <div className="stat-icon orders"><FaShoppingBag /></div>
                        <div className="stat-data">
                            <span className="label">Total Orders</span>
                            <h2 className="val">{summary?.totalOrders || 0}</h2>
                        </div>
                    </div>
                    <div className="stat-card today-card">
                        <div className="stat-icon today"><FaCheckCircle /></div>
                        <div className="stat-data">
                            <span className="label">Today Sales</span>
                            <h2 className="val">{formatCurrency(summary?.todaySales || 0)}</h2>
                        </div>
                    </div>
                    <div className="stat-card month-card">
                        <div className="stat-icon trend"><FaChartLine /></div>
                        <div className="stat-data">
                            <span className="label">Monthly Sales</span>
                            <h2 className="val">{formatCurrency(summary?.monthlySales || 0)}</h2>
                        </div>
                    </div>
                </div>

                {/* Row 2: Payment Mode Metrics */}
                <div className="stats-row row-3-cols mt-6 centered-row">
                    <div className="stat-card cash-card">
                        <div className="stat-icon cash"><FaWallet /></div>
                        <div className="stat-data">
                            <span className="label">Cash Sales</span>
                            <h2 className="val">{formatCurrency(summary?.cashSales || 0)}</h2>
                        </div>
                    </div>
                    <div className="stat-card upi-card">
                        <div className="stat-icon upi"><FaQrcode /></div>
                        <div className="stat-data">
                            <span className="label">UPI Sales</span>
                            <h2 className="val">{formatCurrency(summary?.upiSales || 0)}</h2>
                        </div>
                    </div>
                    <div className="stat-card card-card">
                        <div className="stat-icon card"><FaCreditCard /></div>
                        <div className="stat-data">
                            <span className="label">Card Sales</span>
                            <h2 className="val">{formatCurrency(summary?.cardSales || 0)}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <Card className="filter-card no-print">
                <div className="filter-inner">
                    <div className="filter-inputs">
                        <div className="input-field">
                            <label><FaCalendarAlt /> Start Date</label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                        </div>
                        <div className="input-field">
                            <label><FaCalendarAlt /> End Date</label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                        </div>
                        {user?.role === 'admin' && (
                            <div className="input-field">
                                <label><FaUser /> Staff Filter</label>
                                <select name="staffId" value={filters.staffId} onChange={handleFilterChange}>
                                    <option value="">All Staff</option>
                                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="input-field">
                            <label><FaCreditCard /> Payment Mode</label>
                            <select name="paymentMode" value={filters.paymentMode} onChange={handleFilterChange}>
                                <option value="">All Modes</option>
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                                <option value="UPI">UPI</option>
                            </select>
                        </div>
                        <div className="input-field search">
                            <label><FaSearch /> Invoice Search</label>
                            <input type="text" name="search" placeholder="INV-001..." value={filters.search} onChange={handleFilterChange} />
                        </div>
                    </div>
                    <div className="filter-actions">
                        <button className="btn-apply" onClick={applyFilters}><FaFilter /> Apply</button>
                        <button className="btn-clear" onClick={clearFilters}>Clear</button>
                    </div>
                </div>
            </Card>

            {/* Charts and Top Products Section */}
            <div className="charts-grid no-print">
                <Card title="Revenue (Last 7 Days)" icon={<FaChartLine />}>
                    <div className="chart-container">
                        <Line data={lineChartData} options={chartOptions} />
                    </div>
                </Card>
                <Card 
                    title="Top Selling Products" 
                    icon={<FaShoppingBag />}
                    extra={
                        <button 
                            onClick={handlePrintTopProducts} 
                            style={{ 
                                background: '#f1f5f9', 
                                border: '1px solid #e2e8f0', 
                                padding: '6px 12px', 
                                borderRadius: '8px', 
                                fontSize: '11px', 
                                fontWeight: '700', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                cursor: 'pointer',
                                color: '#475569'
                            }}
                        >
                            <FaPrint /> Print List
                        </button>
                    }
                >
                    <div className="top-products-list">
                        {charts?.topProducts?.length === 0 ? (
                            <div className="flex-center h-full text-muted italic">No data available</div>
                        ) : (
                            charts?.topProducts?.map((prod, idx) => (
                                <div key={idx} className="top-prod-item">
                                    <div className="prod-rank">{idx + 1}</div>
                                    <div className="prod-details">
                                        <span className="prod-name">{prod.name}</span>
                                        <span className="prod-meta">{prod.totalSold} Units Sold</span>
                                    </div>
                                    <div className="prod-revenue">{formatCurrency(prod.revenue)}</div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* Sales Table */}
            <Card 
                title="Sales Record" 
                icon={<FaFileInvoiceDollar />} 
                noPadding 
                className=""
                headerAction={
                    <button 
                        onClick={() => window.print()} 
                        className="btn-print-direct no-print"
                        style={{ 
                            background: '#f1f5f9', 
                            border: '1px solid #e2e8f0', 
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            cursor: 'pointer',
                            color: '#475569'
                        }}
                    >
                        <FaPrint /> Print Table
                    </button>
                }
            >
                <div className="table-wrapper">
                    <table className="performance-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Date</th>
                                {user?.role === 'admin' && <th>Sold By</th>}
                                <th>Payment Mode</th>
                                <th>Total Amount</th>

                                <th style={{ textAlign: 'center' }} className="no-print">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills?.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-muted">No sales records found for selected filters.</td></tr>
                            ) : (
                                bills?.map((bill) => (
                                    <tr key={bill.invoiceNumber}>
                                        <td className="font-bold">#INV-{bill.invoiceNumber}</td>
                                        <td>{new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        {user?.role === 'admin' && <td>{bill.soldBy}</td>}
                                        <td>
                                            <span className={`badge-pill ${bill.paymentMode?.toLowerCase()}`}>
                                                {bill.paymentMode}
                                            </span>
                                        </td>
                                        <td className="font-bold text-indigo">{formatCurrency(bill.totalAmount)}</td>
                                        <td style={{ textAlign: 'center' }} className="no-print">
                                            <div className="action-row-flex" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button className="view-btn" title="View Details" onClick={() => handleViewBill(bill.invoiceNumber)}>
                                                    <FaEye />
                                                </button>
                                                <button className="view-btn print-direct" title="Print Invoice" onClick={() => handlePrintDirect(bill.invoiceNumber)}>
                                                    <FaPrint />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* MODAL SECTION */}
            {showModal && (
                <div className="fixed-overlay no-print">
                    <div className="modal-inner">
                        <button className="close-x" onClick={() => setShowModal(false)}><FaTimes /></button>
                        {modalLoading ? (
                            <div className="flex-center py-12"><div className="spinner-pro"></div></div>
                        ) : selectedBill ? (
                            <div className="bill-detail-view">
                                <h2 className="modal-title">Invoice Details</h2>
                                <div className="bill-info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Invoice No</span>
                                        <span className="info-val">#INV-{selectedBill.id}</span>
                                    </div>
                                    <div className="info-item text-right">
                                        <span className="info-label">Date</span>
                                        <span className="info-val">{selectedBill.date}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Customer</span>
                                        <span className="info-val">{selectedBill.customerName}</span>
                                    </div>
                                    <div className="info-item text-right">
                                        <span className="info-label">Staff</span>
                                        <span className="info-val">{selectedBill.staffName}</span>
                                    </div>
                                </div>

                                <table className="modal-items-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th className="text-center">Qty</th>
                                            <th className="text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedBill.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.productName}</td>
                                                <td className="text-center">{item.quantity}</td>
                                                <td className="text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="modal-total-section">
                                    <div className="total-row">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(selectedBill.total_amount)}</span>
                                    </div>
                                    <div className="total-row final">
                                        <span>Total Amount</span>
                                        <span>{formatCurrency(selectedBill.total_amount)}</span>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-print" onClick={handlePrint}><FaPrint /> Print Invoice</button>
                                    <button className="btn-close" onClick={() => setShowModal(false)}>Close</button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
        .performance-page { animation: fadeIn 0.4s ease-out; }
        .only-print { display: none; } /* Hide from screen */
        .page-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-header-flex h1 { font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin: 0; }
        .header-info p { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
        
        .header-actions { display: flex; align-items: center; gap: 10px; }
        .btn-print-view { 
            background: var(--primary) !important; 
            color: #ffffff !important; 
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 10px !important;
            font-weight: 700 !important;
            font-size: 13px !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            cursor: pointer !important;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
            transition: all 0.2s ease !important;
        }
        .btn-print-view:hover { 
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 15px rgba(99, 102, 241, 0.35) !important;
            filter: brightness(1.1) !important;
        }
        .btn-print-view:active {
            transform: translateY(0) !important;
        }
                
                .stats-container { margin-bottom: 24px; }
                .stats-row { display: flex; gap: 12px; flex-wrap: wrap; }
                .centered-row { justify-content: center; }

                .stat-card {
                    background: #ffffff;
                    padding: 12px 16px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid #e2e8f0;
                    flex: 1;
                    min-width: 200px;
                    transition: all 0.2s;
                }
                .stat-card:hover { border-color: #cbd5e1; background: #f8fafc; }
                
                .stat-icon {
                    width: 32px; height: 32px; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px; flex-shrink: 0;
                }
                
                /* Subtle Icon Colors */
                .stat-icon.rev { background: #eff6ff; color: #3b82f6; }
                .stat-icon.orders { background: #f5f3ff; color: #6366f1; }
                .stat-icon.today { background: #ecfdf5; color: #10b981; }
                .stat-icon.trend { background: #fff7ed; color: #f59e0b; }
                .stat-icon.cash { background: #f1f5f9; color: #475569; }
                .stat-icon.upi { background: #f1f5f9; color: #475569; }
                .stat-icon.card { background: #f1f5f9; color: #475569; }
                
                .stat-data .label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; }
                .stat-data .val { font-size: 16px; font-weight: 700; color: #1e293b; margin-top: 1px; }

                @media (max-width: 1400px) {
                    .stats-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 768px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .stats-grid { grid-template-columns: 1fr; }
                }

                .filter-card { margin-bottom: 24px; }
                .filter-inner { padding: 20px; }
                .filter-inputs { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
                .input-field label { display: block; font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; }
                .filter-actions { margin-top: 20px; display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 20px; }
                
                .btn-apply { background: var(--primary); color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                .btn-clear { background: var(--bg-body); color: var(--text-main); border: 1px solid var(--border); padding: 10px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; }

                .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-bottom: 24px; }
                .chart-container { height: 300px; padding: 10px 0; }

                .table-wrapper { overflow-x: auto; }
                .performance-table { width: 100%; border-collapse: collapse; }
                .performance-table th { background: var(--table-header); color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; padding: 16px 20px; text-align: left; border-bottom: 1px solid var(--border); }
                .performance-table td { padding: 16px 20px; font-size: 14px; border-bottom: 1px solid var(--border); color: var(--text-main); }
                .performance-table tr:hover td { background: var(--table-stripe); }
                
                .badge-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
                .badge-pill.cash { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .badge-pill.upi { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
                .badge-pill.card { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                
                .view-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-body); color: var(--primary); cursor: pointer; transition: 0.2s; }
                .view-btn:hover { background: var(--primary); color: #fff; }

                /* Top Products List Styling */
                .top-products-list { display: flex; flex-direction: column; gap: 12px; height: 300px; overflow-y: auto; padding-right: 8px; }
                .top-prod-item { display: flex; align-items: center; gap: 14px; padding: 12px; background: var(--bg-body); border-radius: 12px; border: 1px solid var(--border); transition: 0.2s; }
                .top-prod-item:hover { border-color: var(--primary); transform: translateX(5px); }
                .prod-rank { width: 28px; height: 28px; background: var(--primary); color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
                .prod-details { flex: 1; display: flex; flex-direction: column; }
                .prod-name { font-size: 13px; font-weight: 700; color: var(--text-main); }
                .prod-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
                .prod-revenue { font-size: 13px; font-weight: 800; color: #10b981; }

                .fixed-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px; backdrop-filter: blur(8px); }
                .modal-inner { background: var(--bg-card); width: 100%; maxWidth: 500px; border-radius: 20px; padding: 32px; position: relative; border: 1px solid var(--border); box-shadow: var(--shadow-premium); }
                .close-x { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 20px; color: var(--text-muted); cursor: pointer; }
                .modal-title { font-size: 20px; font-weight: 800; margin-bottom: 24px; color: var(--text-main); border-bottom: 2px solid var(--primary); display: inline-block; padding-bottom: 4px; }
                
                .bill-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; background: var(--bg-body); padding: 16px; border-radius: 12px; }
                .info-label { display: block; font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
                .info-val { font-size: 13px; font-weight: 700; color: var(--text-main); }
                
                .modal-items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                .modal-items-table th { text-align: left; padding: 10px 0; font-size: 11px; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); }
                .modal-items-table td { padding: 12px 0; border-bottom: 1px solid #f9f9f9; font-size: 13px; color: var(--text-main); }
                
                .modal-total-section { background: var(--bg-body); padding: 16px; border-radius: 12px; }
                .total-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: var(--text-muted); }
                .total-row.final { border-top: 1px dashed var(--border); padding-top: 12px; margin-top: 4px; font-size: 18px; font-weight: 800; color: var(--primary); }
                
                .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
                .btn-print { flex: 2; background: var(--primary); color: #fff; border: none; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .btn-close { flex: 1; background: var(--bg-body); color: var(--text-main); border: 1px solid var(--border); padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; }

                .text-indigo { color: var(--primary); }
                @media (max-width: 768px) {
                    .charts-grid { grid-template-columns: 1fr; }
                    .modal-inner { padding: 20px; }
                }

                @media print {
                    @page { margin: 1cm; size: landscape; }
                    .performance-page { margin: 0 !important; padding: 0 !important; background: white !important; }
                    .no-print { display: none !important; }
                    .only-print { display: block !important; }

                    /* EXCEL HEADER */
                    .only-print { text-align: center !important; margin-bottom: 25pt !important; border-bottom: 2px solid #000 !important; padding-bottom: 15pt !important; }
                    .only-print h1 { font-size: 28pt !important; font-weight: 900 !important; margin: 0 !important; color: #000 !important; text-transform: uppercase !important; }
                    .only-print h2 { font-size: 14pt !important; color: #333 !important; margin-top: 5pt !important; text-transform: uppercase !important; letter-spacing: 3px !important; font-weight: 700 !important; }
                    .only-print p { font-size: 10pt !important; color: #000 !important; margin-top: 5pt !important; font-weight: 600 !important; }

                    /* EXCEL SUMMARY ROW (TOP) */
                    .stats-container { 
                        display: block !important; 
                        margin-bottom: 25pt !important;
                    }
                    .stats-row {
                        display: flex !important;
                        flex-direction: row !important;
                        width: 100% !important;
                        border: 1pt solid #000 !important;
                        gap: 0 !important;
                        margin-bottom: 12pt !important;
                    }
                    .stat-card {
                        flex: 1 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        padding: 10pt !important;
                        border: none !important;
                        border-right: 1pt solid #000 !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        background: white !important;
                        min-width: 0 !important;
                    }
                    .stat-card:last-child { border-right: none !important; }
                    .stat-icon { display: none !important; }
                    .stat-data { text-align: center !important; }
                    .stat-data .label { font-size: 8pt !important; font-weight: bold !important; color: #000 !important; text-transform: uppercase !important; }
                    .stat-data .val { font-size: 12pt !important; font-weight: 900 !important; color: #000 !important; margin-top: 3pt !important; }

                    /* EXCEL TABLE */
                    .table-wrapper { overflow: visible !important; width: 100% !important; }
                    .performance-table { 
                        width: 100% !important; 
                        border-collapse: collapse !important; 
                        border: 1.2pt solid #000 !important;
                    }
                    .performance-table th { 
                        background: #f3f4f6 !important; 
                        border: 1pt solid #000 !important; 
                        color: #000 !important; 
                        padding: 10pt 8pt !important; 
                        font-size: 10pt !important;
                        font-weight: 900 !important;
                        text-transform: uppercase !important;
                        text-align: center !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .performance-table td { 
                        border: 0.8pt solid #000 !important; 
                        padding: 8pt 10pt !important; 
                        font-size: 10pt !important; 
                        color: #000 !important;
                        text-align: center !important;
                    }
                    .performance-table tr:nth-child(even) { background: #f9fafb !important; -webkit-print-color-adjust: exact; }

                    /* HIDE CHARTS AND FILTERS */
                    .charts-grid, .filter-card { display: none !important; }
                }
            `}} />
        </div>
    );
};

export default SalesPerformance;
