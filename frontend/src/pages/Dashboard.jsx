import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { formatCurrency } from '../utils';
import { 
    FaBox, 
    FaUsers, 
    FaShoppingCart, 
    FaMoneyBillWave, 
    FaExclamationTriangle,
    FaArrowUp,
    FaPlus,
    FaPrint,
    FaFileInvoiceDollar,
    FaWallet,
    FaQrcode,
    FaCreditCard
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        revenueToday: 0,
        salesToday: 0,
        totalProducts: 0,
        totalStock: 0,
        totalStaff: 0,
        lowStock: 0,
        chartData: [],
        inventory: [],
        recentBills: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchStats(parsedUser.role);
        } else {
            fetchStats();
        }
    }, []);

    const fetchStats = async () => {
        try {
            const data = await api.get('/admin/dashboard');
            if (data) {
                setStats(prev => ({
                    ...prev,
                    ...data
                }));
            }
        } catch (err) {
            console.error('Stats fetch failed:', err);
            toast.error('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrintStockAlerts = () => {
        const alertedItems = stats.inventory.filter(item => item.stock < (item.low_stock_limit || 10));
        
        if (alertedItems.length === 0) {
            toast.error("No stock alerts to print!");
            return;
        }

        // Create a hidden iframe for printing
        let iframe = document.getElementById('print-iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'print-iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }

        const date = new Date().toLocaleDateString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const htmlContent = `
            <html>
                <head>
                    <title>Stock Alert Report</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                        body { font-family: 'Inter', sans-serif; padding: 20px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
                        .shop-name { font-size: 24px; font-weight: 900; color: #1e293b; margin: 0; }
                        .report-title { font-size: 12px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 5px; }
                        .date { font-size: 10px; color: #94a3b8; margin-top: 8px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #f8fafc; color: #475569; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
                        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
                        .product-name { font-weight: 700; }
                        .status-badge { font-weight: 800; font-size: 9px; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; display: inline-block; }
                        .status-out { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
                        .status-crit { background: #fff1f2; color: #be123c; border: 1px solid #ffe4e6; }
                        .status-low { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="shop-name">ADITYA RETAIL SHOP</h1>
                        <div class="report-title">Inventory Alert Report</div>
                        <div class="date">Generated: ${date}</div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50px;">SL No.</th>
                                <th>Product</th>
                                <th style="text-align: center;">Current Stock</th>
                                <th style="text-align: center;">Priority Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${alertedItems.map((item, index) => `
                                <tr>
                                    <td style="text-align: center; color: #64748b; font-weight: 600;">${index + 1}</td>
                                    <td class="product-name">${item.name}</td>
                                    <td style="text-align: center; font-weight: 800;">${item.stock} Units</td>
                                    <td style="text-align: center;">
                                        <span class="status-badge ${item.stock === 0 ? 'status-out' : item.stock < ((item.low_stock_limit || 10) / 2) ? 'status-crit' : 'status-low'}">
                                            ${item.stock === 0 ? 'Out of Stock' : item.stock < ((item.low_stock_limit || 10) / 2) ? 'Critical' : 'Low Stock'}
                                        </span>
                                    </td>
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

        // Trigger print directly from iframe
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 500);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#111827',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                displayColors: false,
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' },
                ticks: { font: { size: 11 } }
            },
        },
    };

    const labels = stats.chartData.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }));
    const dataValues = stats.chartData.map(d => parseFloat(d.sales));
    
    const chartData = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Sales',
                data: dataValues,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.05)',
                tension: 0.4,
                pointBackgroundColor: '#4f46e5',
                pointRadius: 0,
                pointHoverRadius: 6,
            }
        ]
    };

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8 no-print">
                <h1 className="text-2xl font-bold">
                    {user?.role === 'admin' ? 'Business Overview' : 'Staff Terminal'}
                </h1>
                <p className="text-muted text-sm mt-1">
                    {user?.role === 'admin' ? 'Real-time performance and analytics' : `Logged in as ${user?.name}`}
                </p>
            </div>

            <div className="stats-summary-grid no-print">
                {user?.role === 'admin' ? (
                    <div className="summary-box-card">
                        <div className="box-icon-row">
                            <FaMoneyBillWave className="box-icon revenue" />
                        </div>
                        <div className="box-content">
                            <span className="box-title">Total Revenue</span>
                            <h2 className="box-value">{formatCurrency(stats.totalRevenue)}</h2>
                            <span className="box-growth text-success">
                                <FaArrowUp /> Gross earnings
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="summary-box-card" onClick={() => navigate('/billing')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: 'white', border: 'none' }}>
                        <div className="box-icon-row">
                            <FaPlus className="box-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} />
                        </div>
                        <div className="box-content">
                            <span className="box-title" style={{ color: 'rgba(255,255,255,0.7)' }}>Quick Action</span>
                            <h2 className="box-value" style={{ color: 'white' }}>Create New Bill</h2>
                            <span className="box-growth" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                Start a new transaction
                            </span>
                        </div>
                    </div>
                )}

                <div className="summary-box-card" onClick={() => navigate('/performance')} style={{ cursor: 'pointer' }}>
                    <div className="box-icon-row">
                        <FaShoppingCart className="box-icon sales" />
                    </div>
                    <div className="box-content">
                        <span className="box-title">Sales Today</span>
                        <h2 className="box-value">{formatCurrency(stats.revenueToday)}</h2>
                        <span className="box-growth">
                            <span className="font-bold text-dark">{stats.salesToday}</span> 
                            <span className="text-muted font-normal ml-1">Orders completed</span>
                        </span>
                    </div>
                </div>

                <div className="summary-box-card" onClick={() => user?.role === 'admin' && navigate('/inventory')} style={{ cursor: user?.role === 'admin' ? 'pointer' : 'default' }}>
                    <div className="box-icon-row">
                        <FaBox className={`box-icon ${stats.lowStock > 0 ? 'warning' : 'inventory'}`} />
                    </div>
                    <div className="box-content">
                        <span className="box-title">Active Inventory</span>
                        <h2 className="box-value">{stats.totalProducts} <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>Items</span></h2>
                        <span className={`box-growth ${stats.lowStock > 0 ? 'text-danger' : 'text-success'}`}>
                            {stats.totalStock} units available
                        </span>
                    </div>
                </div>

                {user?.role === 'admin' && (
                    <div className="summary-box-card">
                        <div className="box-icon-row">
                            <FaUsers className="box-icon team" />
                        </div>
                        <div className="box-content">
                            <span className="box-title">Team Members</span>
                            <h2 className="box-value">{stats.totalStaff}</h2>
                            <span className="box-growth text-muted">
                                Active staff accounts
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="dashboard-visuals-grid no-print">
                <div className="visual-column">
                    <Card title="Revenue Performance" subtitle="Daily sales trend for the last 7 days">
                        <div className="chart-container" style={{ height: '300px', marginTop: '24px' }}>
                            {stats.chartData.length > 0 ? (
                                <Line options={chartOptions} data={chartData} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted italic text-sm">
                                    No sales data recorded for this period.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="visual-column">
                    <Card 
                        title="Stock Alerts" 
                        icon={<FaExclamationTriangle className="text-danger" />} 
                        noPadding
                        extra={
                            <button 
                                onClick={handlePrintStockAlerts}
                                className="dashboard-print-btn"
                                title="Print Alert List"
                            >
                                <FaPrint /> <span>Print List</span>
                            </button>
                        }
                    >
                        <div className="invoice-table-wrapper" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                            <table className="dashboard-table compact">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th className="text-center">Stock</th>
                                        <th className="text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.inventory && stats.inventory.filter(item => item.stock < (item.low_stock_limit || 10)).length > 0 ? (
                                        stats.inventory.filter(item => item.stock < (item.low_stock_limit || 10)).map((item) => (
                                            <tr key={item.id}>
                                                <td className="font-bold text-dark text-xs">{item.name}</td>
                                                <td className="text-center">
                                                    <span className={`font-black ${item.stock < ((item.low_stock_limit || 10) / 2) ? 'text-danger' : 'text-warning'}`} style={{ fontSize: '12px' }}>
                                                        {item.stock}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge-pill ${item.stock === 0 ? 'upi' : item.stock < ((item.low_stock_limit || 10) / 2) ? 'card' : 'cash'}`} style={{ fontSize: '8px', padding: '2px 6px' }}>
                                                        {item.stock === 0 ? 'Out' : item.stock < ((item.low_stock_limit || 10) / 2) ? 'Crit' : 'Low'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-12 text-success font-bold text-xs">
                                                ✨ Well-stocked!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {user?.role === 'admin' && (
                            <div style={{ padding: '12px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <button onClick={() => navigate('/inventory')} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase' }}>Manage Full Inventory &rarr;</button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Recent Sales Table */}
            <div className="mt-10 no-print">
                <Card 
                    title={user?.role === 'admin' ? "Recent Shop Sales" : "Your Recent Sales History"} 
                    icon={<FaFileInvoiceDollar className="text-indigo-600" />} 
                    noPadding
                >
                    <div className="invoice-table-wrapper" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    {user?.role === 'admin' && <th>Sold By</th>}
                                    <th>Payment</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentBills && stats.recentBills.length > 0 ? (
                                    stats.recentBills.map((bill) => (
                                        <tr key={bill.orderId}>
                                            <td className="font-bold text-indigo-600">#INV-{bill.orderId}</td>
                                            <td className="text-xs text-slate-500">
                                                {new Date(bill.created_at).toLocaleDateString('en-IN', { 
                                                    day: '2-digit', 
                                                    month: 'short', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </td>
                                            <td className="font-medium">{bill.customer_name}</td>
                                            {user?.role === 'admin' && <td className="text-xs italic text-slate-500">{bill.staffName}</td>}
                                            <td>
                                                <span className={`badge-pill ${bill.payment_method?.toLowerCase()}`}>
                                                    {bill.payment_method}
                                                </span>
                                            </td>
                                            <td className="text-right font-bold text-slate-800">{formatCurrency(bill.total_amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={user?.role === 'admin' ? 6 : 5} className="text-center py-16 text-slate-400 italic">
                                            No sales recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                        <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                            <button onClick={() => navigate('/performance')} style={{ border: 'none', background: 'none', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                View Full Sales Analytics &rarr;
                            </button>
                        </div>
                    )}
                </Card>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .stats-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
                .summary-box-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); transition: all 0.3s ease; border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 12px; }
                .summary-box-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(0,0,0,0.12); }
                .box-icon { width: 42px; height: 42px; padding: 10px; border-radius: 12px; font-size: 20px; }
                .box-icon.revenue { background: #f5f3ff; color: #4f46e5; }
                .box-icon.sales { background: #ecfdf5; color: #10b981; }
                .box-icon.inventory { background: #eff6ff; color: #3b82f6; }
                .box-icon.warning { background: #fffbeb; color: #f59e0b; }
                .box-icon.team { background: #fdf2f8; color: #ec4899; }
                .box-title { font-size: 13px; font-weight: 600; color: #64748b; }
                .box-value { font-size: 26px; font-weight: 800; color: #1e293b; }
                .box-growth { display: flex; align-items: center; gap: 4px; font-size: 12px; margin-top: 8px; font-weight: 600; }
                
                .dashboard-visuals-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; margin-top: 40px; }
                @media (max-width: 1200px) {
                    .dashboard-visuals-grid { grid-template-columns: 1fr; }
                }

                .dashboard-table.compact th, .dashboard-table.compact td { padding: 10px 16px; }
                .dashboard-table.compact td { font-size: 12px; }
                .dashboard-table { width: 100%; border-collapse: collapse; }
                .dashboard-table th { padding: 16px 24px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
                .dashboard-table td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: middle; }
                
                .badge-pill { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
                .badge-pill.cash { background: #ecfdf5; color: #059669; }
                .badge-pill.card { background: #eff6ff; color: #2563eb; }
                .badge-pill.upi { background: #fffbeb; color: #d97706; }

                .dashboard-print-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .dashboard-print-btn:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                    transform: translateY(-1px);
                }

                .dashboard-print-btn svg {
                    font-size: 14px;
                    color: #6366f1;
                }

                .collection-breakdown-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-top: 10px;
                }

                .collection-item {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.2s;
                }

                .collection-item:hover {
                    background: #f1f5f9;
                    transform: translateX(4px);
                    border-color: #cbd5e1;
                }

                .item-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }

                .item-icon.cash { background: #ecfdf5; color: #10b981; }
                .item-icon.upi { background: #f5f3ff; color: #6366f1; }
                .item-icon.card-pay { background: #eff6ff; color: #3b82f6; }

                .item-info { display: flex; flex-direction: column; }
                .item-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .item-value { font-size: 16px; font-weight: 800; color: #1e293b; margin: 2px 0 0; }
            `}} />
        </div>
    );
};

export default Dashboard;
