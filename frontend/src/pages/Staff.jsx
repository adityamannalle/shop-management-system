import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { FaUserPlus, FaTrash, FaUserShield, FaUserTag, FaEnvelope, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Card from '../components/Card';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'staff' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const data = await api.get('/auth/staff');
            setStaff(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/auth/register', formData);
            toast.success('Staff member registered');
            setFormData({ name: '', email: '', password: '', role: 'staff' });
            fetchStaff();
        } catch (err) {
            // Toast handled in api helper
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Revoke access for this member?')) return;
        try {
            await api.delete(`/auth/staff/${id}`);
            toast.success('Member removed');
            fetchStaff();
        } catch (err) {
            if (err.message.includes('foreign key constraint')) {
                toast.error('Cannot remove staff with active sales records');
            }
        }
    };

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="staff-container">
            {/* 2. PRINT HEADER (Centered Shop Name) */}
            <div className="only-print text-center mb-10">
                <h1 className="print-shop-name">Aditya Retail Shop</h1>
                <h2 className="print-subtitle">Team Management Report</h2>
            </div>

            <div className="page-header mb-8 no-print">
                <h1 className="text-2xl font-bold">Team Management</h1>
                <p className="text-muted text-sm mt-1">Manage workspace access and permissions</p>
            </div>

            <div className="staff-grid">
                {/* Form Side */}
                <div className="form-side no-print">
                    <Card title="Add Member" icon={<FaUserPlus />}>
                        <form onSubmit={handleSubmit} className="pro-form mt-4">
                            <div className="field">
                                <label>Full Name</label>
                                <input 
                                    required 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="field">
                                <label>Email</label>
                                <input 
                                    type="email"
                                    required 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="john@company.com"
                                />
                            </div>
                            <div className="field">
                                <label>Password</label>
                                <input 
                                    type="password"
                                    required 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    placeholder="••••••••"
                                />
                            </div>
                            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Registering...' : 'Grant Access'}
                            </button>
                        </form>
                    </Card>
                </div>

                {/* List Side */}
                <div className="list-side">
                    <Card 
                        title="Workspace Members" 
                        icon={<FaUserShield />} 
                        noPadding 
                        extra={
                            <button 
                                onClick={() => window.print()} 
                                className="btn-print-mini no-print"
                            >
                                <FaPrint /> Print List
                            </button>
                        }
                    >
                        <div className="table-wrapper">
                            <table className="staff-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th className="text-center no-print">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.map(member => (
                                        <tr key={member.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="avatar">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="u-name">{member.name}</p>
                                                        <p className="u-email">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`role-badge ${member.role}`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="text-muted text-xs">
                                                {new Date(member.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="text-center no-print">
                                                <button className="revoke-btn" onClick={() => handleDelete(member.id)}>
                                                    <FaTrash size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .only-print { display: none; }
                .staff-grid { display: grid; grid-template-columns: 350px 1fr; gap: var(--space-md); }
                .pro-form { display: flex; flex-direction: column; gap: 20px; }
                .field { display: flex; flex-direction: column; gap: 8px; }
                .field label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; }
                .field input, .field select { padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px; background: #f9fafb; }
                .submit-btn { padding: 14px; background: var(--primary); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 20px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); transition: 0.2s; }
                .submit-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

                .btn-print-mini {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #475569;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-print-mini:hover { background: #f1f5f9; border-color: #cbd5e1; color: #1e293b; }

                .staff-table { width: 100%; border-collapse: collapse; }
                .staff-table th { padding: 16px 24px; text-align: left; font-size: 12px; color: #64748b; background: #f8fafc; text-transform: uppercase; border-bottom: 1px solid #eee; }
                .staff-table th.text-center { text-align: center; }
                .staff-table td { padding: 16px 24px; border-bottom: 1px solid #f9f9f9; }
                .staff-table td.text-center { text-align: center; }
                
                .user-cell { display: flex; align-items: center; gap: 12px; }
                .avatar { width: 36px; height: 36px; background: #f5f3ff; color: #4f46e5; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; border: 1px solid #ddd6fe; }
                .u-name { font-weight: 700; font-size: 14px; color: #1e293b; }
                .u-email { font-size: 12px; color: #64748b; }
                
                .role-badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                .role-badge.admin { background: #f5f3ff; color: #4f46e5; }
                .role-badge.staff { background: #f1f5f9; color: #64748b; }
                
                .revoke-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: #fef2f2; color: #ef4444; cursor: pointer; transition: 0.2s; }
                .revoke-btn:hover { background: #ef4444; color: white; }

                @media print {
                    @page { margin: 1cm; size: portrait; }
                    body { background: white !important; }
                    .page-header, .form-side, .no-print { display: none !important; }
                    .only-print { display: block !important; }
                    
                    .staff-container { padding: 0 !important; }
                    .staff-grid { display: block !important; }
                    .list-side { width: 100% !important; margin: 0 !important; }
                    
                    /* EXCEL HEADER */
                    .only-print { text-align: center !important; margin-bottom: 25pt !important; border-bottom: 2px solid #000 !important; padding-bottom: 15pt !important; }
                    .print-shop-name { font-size: 28pt !important; font-weight: 900 !important; margin: 0 !important; color: #000 !important; text-transform: uppercase !important; }
                    .print-subtitle { font-size: 14pt !important; color: #333 !important; margin-top: 5pt !important; text-transform: uppercase !important; letter-spacing: 3px !important; font-weight: 700 !important; }

                    .premium-card { 
                        box-shadow: none !important; 
                        border: none !important; 
                        padding: 0 !important; 
                        background: white !important;
                    }
                    .card-header { display: none !important; }
                    
                    /* EXCEL TABLE */
                    .staff-table { 
                        width: 100% !important; 
                        border-collapse: collapse !important;
                        border: 1.2pt solid #000 !important;
                    }
                    .staff-table th, .staff-table td { 
                        border: 0.8pt solid #000 !important; 
                        padding: 8pt 10pt !important;
                        color: #000 !important;
                        font-size: 10pt !important;
                        text-align: center !important;
                    }
                    .staff-table th { 
                        background: #f3f4f6 !important; 
                        -webkit-print-color-adjust: exact;
                        font-weight: 900 !important;
                        text-transform: uppercase !important;
                        border: 1pt solid #000 !important;
                    }
                    .staff-table tr:nth-child(even) { background: #f9fafb !important; -webkit-print-color-adjust: exact; }
                    
                    .avatar { display: none !important; }
                    .user-cell { display: block !important; }
                    .u-name { font-weight: 700 !important; font-size: 10pt !important; }
                    .u-email { font-size: 9pt !important; }
                    
                    .role-badge { 
                        background: transparent !important; 
                        color: #000 !important; 
                        padding: 0 !important; 
                        font-weight: normal !important; 
                        text-transform: uppercase !important;
                        font-size: 10pt !important;
                    }
                }

                @media (max-width: 1024px) {
            `}} />
        </div>
    );
};

export default Staff;
