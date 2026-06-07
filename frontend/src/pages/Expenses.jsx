import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { formatCurrency } from '../utils';
import { FaTrash, FaPlus, FaMoneyBillWave, FaReceipt, FaHistory, FaCalendarAlt, FaPrint } from 'react-icons/fa';
import Card from '../components/Card';
import toast from 'react-hot-toast';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summaryData, setSummaryData] = useState({ totalRevenue: 0, totalExpenses: 0, netProfit: 0 });
    const [dateFilters, setDateFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'General',
        date: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchExpenses(dateFilters.startDate, dateFilters.endDate);
        fetchSummary();
    }, []);

    const fetchExpenses = async (start, end) => {
        try {
            let url = '/expenses';
            if (start && end) {
                url += `?startDate=${start}&endDate=${end}`;
            }
            const data = await api.get(url);
            setExpenses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const query = `?startDate=${dateFilters.startDate}&endDate=${dateFilters.endDate}`;
            const data = await api.get(`/admin/expenses-summary${query}`);
            setSummaryData(data);
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        }
    };

    const handleFilterChange = (e) => {
        setDateFilters({ ...dateFilters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        fetchExpenses(dateFilters.startDate, dateFilters.endDate);
        fetchSummary();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/expenses', formData);
            toast.success('Expense recorded successfully');
            setFormData({
                description: '',
                amount: '',
                category: 'General',
                date: new Date().toISOString().split('T')[0]
            });
            fetchExpenses();
            fetchSummary();
        } catch (err) {
            // Error handled in api helper
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense record?')) return;
        try {
            await api.delete(`/expenses/${id}`);
            setExpenses(expenses.filter(e => e.id !== id));
            toast.success('Record removed');
            fetchSummary();
        } catch (err) {
            // Error handled in api helper
        }
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return (
        <div className="expenses-page-wrapper">
            {/* 2. PRINT HEADER (Centered Shop Name) */}
            <div className="only-print text-center mb-10">
                <h1 className="print-shop-name">Aditya Retail Shop</h1>
                <h2 className="print-subtitle">Expense History Report</h2>
            </div>

            {/* Header Section */}
            <div className="expenses-header no-print">
                <div className="header-text">
                    <h1>Financial Control</h1>
                    <p>Track your business performance and outflows</p>
                </div>
                
                <div className="summary-cards-row">
                    {/* TOTAL REVENUE */}
                    <div className="outflow-summary-card revenue">
                        <div className="summary-info">
                            <span className="summary-label">Total Revenue</span>
                            <h2 className="summary-value">{formatCurrency(summaryData.totalRevenue)}</h2>
                        </div>
                    </div>

                    {/* TOTAL EXPENSES */}
                    <div className="outflow-summary-card expenses">
                        <div className="summary-info">
                            <span className="summary-label">Total Expenses</span>
                            <h2 className="summary-value">{formatCurrency(summaryData.totalExpenses)}</h2>
                        </div>
                    </div>

                    {/* NET PROFIT */}
                    <div className={`outflow-summary-card profit ${summaryData.netProfit >= 0 ? 'positive' : 'negative'}`}>
                        <div className="summary-info">
                            <span className="summary-label">Net Profit</span>
                            <h2 className="summary-value">{formatCurrency(summaryData.netProfit)}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* DATE FILTER STRIP */}
            <div className="filter-strip saas-card no-print">
                <div className="filter-group">
                    <label><FaCalendarAlt /> Filter Period:</label>
                    <div className="filter-inputs">
                        <input type="date" name="startDate" value={dateFilters.startDate} onChange={handleFilterChange} />
                        <span>to</span>
                        <input type="date" name="endDate" value={dateFilters.endDate} onChange={handleFilterChange} />
                        <button onClick={applyFilters} className="btn-apply-filters">Apply Filter</button>
                    </div>
                </div>
                <div className="filter-actions">
                    <button onClick={() => window.print()} className="btn-print-expenses">
                        <FaPrint /> Print Report
                    </button>
                    <div className="filter-info-text">
                        * Summary cards update based on this period.
                    </div>
                </div>
            </div>

            {/* 2. MAIN GRID (Desktop: 2 columns, Mobile: 1) */}
            <div className="expenses-main-grid">
                
                {/* LEFT: New Expense Form */}
                <div className="form-column">
                    <div className="saas-card">
                        <div className="card-title-row">
                            <FaReceipt className="title-icon text-primary" />
                            <h3>New Expense</h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="saas-form">
                            <div className="form-field">
                                <label>Description</label>
                                <input 
                                    name="description" 
                                    required 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    placeholder="e.g. Electricity Bill" 
                                />
                            </div>
                            
                            <div className="form-row-compact">
                                <div className="form-field">
                                    <label>Amount (INR)</label>
                                    <input 
                                        type="number" 
                                        name="amount" 
                                        required 
                                        value={formData.amount} 
                                        onChange={handleChange} 
                                        placeholder="0.00" 
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Date</label>
                                    <input 
                                        type="date" 
                                        name="date" 
                                        required 
                                        value={formData.date} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>

                            <div className="form-field">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    <option value="General">General</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Salaries">Salaries</option>
                                    <option value="Inventory">Inventory</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                            </div>

                            <button type="submit" className="btn-gradient-submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span className="spinner-small"></span>
                                ) : (
                                    <><FaPlus /> Record Entry</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT: Expense History Table */}
                <div className="history-column">
                    <div className="saas-card no-padding">
                        <div className="card-title-row padded">
                            <FaHistory className="title-icon text-muted no-print" />
                            <h3>Expense History</h3>
                        </div>
                        
                        <div className="table-responsive-wrapper">
                            <table className="saas-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th className="text-right">Amount</th>
                                        <th className="text-center no-print">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-state-cell">
                                                No expense records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.map(expense => (
                                            <tr key={expense.id}>
                                                <td className="whitespace-nowrap">
                                                    {new Date(expense.date).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="td-main">{expense.description}</td>
                                                <td>
                                                    <span className={`pill-badge ${expense.category.toLowerCase()}`}>
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td className="text-right amount-cell">
                                                    {formatCurrency(expense.amount)}
                                                </td>
                                                <td className="text-center no-print">
                                                    <button className="btn-table-delete" onClick={() => handleDelete(expense.id)}>
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {expenses.length > 0 && (
                                    <tfoot>
                                        <tr className="table-total-row">
                                            <td colSpan="3" className="text-right total-label">GRAND TOTAL:</td>
                                            <td className="text-right total-amount">
                                                {formatCurrency(totalExpenses)}
                                            </td>
                                            <td className="no-print"></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .only-print { display: none; }
                .expenses-page-wrapper { padding-bottom: 40px; }

                .expenses-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 32px;
                    gap: 32px;
                    flex-wrap: wrap;
                }

                .header-text h1 { font-size: 28px; font-weight: 800; color: #111827; margin: 0; }
                .header-text p { font-size: 14px; color: #6b7280; margin-top: 4px; }
                .filter-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
                .btn-print-expenses { 
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.2s;
                    box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
                }
                .btn-print-expenses:hover { background: #4338ca; transform: translateY(-1px); }

                .summary-cards-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    flex: 1;
                    min-width: 600px;
                }

                .outflow-summary-card {
                    background: white;
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                }
                .outflow-summary-card.revenue { border-left: 4px solid #4f46e5; }
                .outflow-summary-card.expenses { border-left: 4px solid #f43f5e; }
                .outflow-summary-card.profit.positive { border-left: 4px solid #10b981; background: #f0fdf4; }
                .outflow-summary-card.profit.negative { border-left: 4px solid #f43f5e; background: #fef2f2; }

                .summary-label { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.05em; }
                .summary-value { font-size: 22px; font-weight: 800; color: #1e293b; margin-top: 4px; }

                /* FILTER STRIP */
                .filter-strip {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    margin-bottom: 32px;
                    background: #f8fafc;
                    border: 1px dashed #cbd5e1;
                }
                .filter-group { display: flex; align-items: center; gap: 16px; }
                .filter-group label { font-size: 13px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 8px; }
                .filter-inputs { display: flex; align-items: center; gap: 12px; }
                .filter-inputs input { height: 36px; padding: 0 10px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; }
                .btn-apply-filters { background: #1e293b; color: white; border: none; padding: 0 16px; height: 36px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-apply-filters:hover { background: #000; }
                .filter-info-text { font-size: 11px; color: #94a3b8; font-style: italic; }

                /* 2. GRID & CARDS */
                .expenses-main-grid {
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 24px;
                }

                .saas-card {
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                    border: 1px solid #f1f5f9;
                }
                .saas-card.no-padding { padding: 0; }
                .card-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
                .card-title-row.padded { padding: 24px 24px 0 24px; }
                .title-icon { font-size: 18px; }
                .card-title-row h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }

                /* 3. FORM STYLING */
                .saas-form { display: flex; flex-direction: column; gap: 20px; }
                .form-field { display: flex; flex-direction: column; gap: 8px; width: 100%; }
                .form-field label { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; }
                .form-field input, .form-field select {
                    height: 44px;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    padding: 0 12px;
                    font-size: 14px;
                    background: #fcfcfd;
                    transition: all 0.2s ease;
                    outline: none;
                    width: 100%;
                    box-sizing: border-box;
                }
                .form-field input:focus, .form-field select:focus {
                    border-color: #6366f1;
                    background: #ffffff;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }
                .form-row-compact { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 16px; 
                }

                @media (max-width: 480px) {
                    .form-row-compact {
                        grid-template-columns: 1fr;
                    }
                }

                /* 4. BUTTON STYLING */
                .btn-gradient-submit {
                    height: 44px;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
                }
                .btn-gradient-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3); filter: brightness(1.1); }
                .btn-gradient-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

                /* 5. TABLE STYLING */
                .table-responsive-wrapper { overflow-x: auto; margin-top: 10px; }
                .saas-table { width: 100%; border-collapse: collapse; }
                .saas-table th { 
                    padding: 16px 24px; 
                    text-align: left; 
                    font-size: 12px; 
                    font-weight: 700; 
                    color: #64748b; 
                    background: #f8fafc; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em;
                }
                .saas-table th.text-right { text-align: right; }
                .saas-table th.text-center { text-align: center; }
                .saas-table td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                .saas-table td.text-right { text-align: right; }
                .saas-table td.text-center { text-align: center; }
                .saas-table tr:hover td { background: #f9fafb; }
                
                .td-main { font-weight: 700; color: #1e293b; font-size: 14px; }
                .td-sub { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
                .amount-cell { font-weight: 800; color: #111827; font-size: 15px; }
                
                .pill-badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; display: inline-block; }
                .pill-badge.general { background: #f1f5f9; color: #64748b; }
                .pill-badge.utilities { background: #fffbeb; color: #d97706; }
                .pill-badge.rent { background: #eff6ff; color: #2563eb; }
                .pill-badge.salaries { background: #f5f3ff; color: #4f46e5; }
                .pill-badge.inventory { background: #ecfdf5; color: #059669; }
                .pill-badge.maintenance { background: #fff1f2; color: #e11d48; }

                .btn-table-delete {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .btn-table-delete:hover { background: #fef2f2; color: #ef4444; }

                .empty-state-cell { text-align: center; padding: 60px 0; color: #94a3b8; font-style: italic; font-size: 14px; }
                
                .table-total-row td { 
                    background: #f8fafc; 
                    border-top: 2px solid #e2e8f0; 
                    padding: 20px 24px;
                }
                .total-label { font-weight: 800; color: #475569; font-size: 12px; letter-spacing: 0.05em; }
                .total-amount { font-weight: 900; color: #4f46e5; font-size: 18px; }

                .spinner-small { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                @media print {
                    @page { margin: 1cm; size: portrait; }
                    body { background: white !important; }
                    .expenses-header, .filter-strip, .form-column, .no-print { display: none !important; }
                    .only-print { display: block !important; }

                    .expenses-page-wrapper { padding: 0 !important; }
                    .expenses-main-grid { display: block !important; }
                    .history-column { width: 100% !important; }
                    
                    /* EXCEL HEADER */
                    .only-print { text-align: center !important; margin-bottom: 25pt !important; border-bottom: 2px solid #000 !important; padding-bottom: 15pt !important; }
                    .print-shop-name { font-size: 28pt !important; font-weight: 900 !important; margin: 0 !important; color: #000 !important; text-transform: uppercase !important; }
                    .print-subtitle { font-size: 14pt !important; color: #333 !important; margin-top: 5pt !important; text-transform: uppercase !important; letter-spacing: 3px !important; font-weight: 700 !important; }

                    .saas-card { box-shadow: none !important; border: none !important; padding: 0 !important; background: white !important; }
                    .card-title-row { display: none !important; }
                    
                    /* EXCEL TABLE */
                    .saas-table { 
                        width: 100% !important; 
                        border-collapse: collapse !important;
                        border: 1.2pt solid #000 !important;
                    }
                    .saas-table th, .saas-table td { 
                        border: 0.8pt solid #000 !important; 
                        padding: 8pt 10pt !important;
                        color: #000 !important;
                        font-size: 10pt !important;
                        text-align: center !important;
                    }
                    .saas-table th { 
                        background: #f3f4f6 !important; 
                        -webkit-print-color-adjust: exact;
                        font-weight: 900 !important;
                        text-transform: uppercase !important;
                        border: 1pt solid #000 !important;
                    }
                    .saas-table tr:nth-child(even) { background: #f9fafb !important; -webkit-print-color-adjust: exact; }

                    .table-total-row td { 
                        background-color: #eee !important; 
                        font-weight: 900 !important; 
                        border-top: 1.2pt solid #000 !important;
                    }
                    .total-label { font-size: 10pt !important; color: #000 !important; text-align: right !important; }
                    .total-amount { font-size: 12pt !important; color: #000 !important; text-align: right !important; }
                    
                    .pill-badge { 
                        background: transparent !important; 
                        color: black !important; 
                        padding: 0 !important; 
                        font-weight: normal !important; 
                        text-transform: none !important;
                    }
                    .td-main { font-weight: normal !important; }
                }

                @media (max-width: 1200px) {
                    .expenses-main-grid { grid-template-columns: 1fr; }
                    .expenses-header { flex-direction: column; align-items: flex-start; }
                    .summary-cards-row { width: 100%; min-width: 0; }
                    .filter-strip { flex-direction: column; gap: 16px; align-items: flex-start; }
                }
                @media (max-width: 600px) {
                    .summary-cards-row { grid-template-columns: 1fr; }
                    .filter-inputs { flex-direction: column; align-items: stretch; width: 100%; }
                    .filter-inputs span { text-align: center; }
                }
            `}} />
        </div>
    );
};

export default Expenses;
