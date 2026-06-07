import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    FaHome, 
    FaBox, 
    FaUsers, 
    FaFileInvoiceDollar, 
    FaChartLine, 
    FaMoneyBillWave, 
    FaSignOutAlt,
    FaStore
} from 'react-icons/fa';

const Sidebar = ({ user, isMobileOpen, toggleSidebar, onLogoutClick }) => {
    const navigate = useNavigate();

    const navItems = [
        { path: '/dashboard', icon: <FaHome />, label: 'Dashboard', roles: ['admin', 'staff'] },
        { path: '/billing', icon: <FaFileInvoiceDollar />, label: 'Billing', roles: ['staff'] },
        { path: '/inventory', icon: <FaBox />, label: 'Inventory', roles: ['admin'] },
        { path: '/performance', icon: <FaChartLine />, label: 'Analytics', roles: ['admin', 'staff'] },
        { path: '/expenses', icon: <FaMoneyBillWave />, label: 'Expenses', roles: ['admin'] },
        { path: '/staff', icon: <FaUsers />, label: 'Team', roles: ['admin'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="sidebar-overlay" onClick={toggleSidebar}></div>
            )}

            <aside className={`sidebar-aside no-print ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-box-premium">
                        <FaStore />
                    </div>
                    <div className="logo-text-group">
                        <span className="logo-text-main">ADITYA</span>
                        <span className="logo-text-sub">RETAIL SHOP</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <p className="nav-label">Main Menu</p>
                    {filteredNavItems.map((item) => (
                        <NavLink 
                            key={item.path} 
                            to={item.path} 
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => window.innerWidth <= 1024 && toggleSidebar()}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={onLogoutClick}>
                        <FaSignOutAlt className="nav-icon" />
                        <span className="nav-text">Sign Out</span>
                    </button>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    .sidebar-aside {
                        width: var(--sidebar-width);
                        height: 100vh;
                        background-color: var(--bg-sidebar);
                        border-right: 1px solid var(--border);
                        position: fixed;
                        left: 0;
                        top: 0;
                        display: flex;
                        flex-direction: column;
                        z-index: 1000;
                        transition: transform 0.3s ease;
                    }
                    
                    .sidebar-header {
                        padding: 24px;
                        display: flex;
                        align-items: center;
                        gap: 14px;
                        border-bottom: 1px solid var(--border);
                        background: linear-gradient(to bottom, #f8fafc, #ffffff);
                    }
                    
                    .logo-box-premium {
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 20px;
                        box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
                    }
                    
                    .logo-text-group {
                        display: flex;
                        flex-direction: column;
                        line-height: 1;
                    }

                    .logo-text-main {
                        font-weight: 900;
                        font-size: 18px;
                        letter-spacing: -0.02em;
                        color: #1e293b;
                    }

                    .logo-text-sub {
                        font-weight: 700;
                        font-size: 10px;
                        letter-spacing: 0.1em;
                        color: var(--primary);
                        text-transform: uppercase;
                        margin-top: 2px;
                    }

                    .logo-text {
                        font-weight: 800;
                        font-size: 18px;
                        letter-spacing: -0.01em;
                        color: var(--text-main);
                    }
                    
                    .sidebar-nav {
                        flex: 1;
                        padding: 0 16px;
                    }
                    
                    .nav-label {
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        font-weight: 700;
                        color: var(--text-muted);
                        margin: 16px 12px 12px;
                    }
                    
                    .nav-link {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 14px;
                        border-radius: 12px;
                        color: var(--text-muted);
                        font-weight: 600;
                        font-size: 14px;
                        margin-bottom: 4px;
                        transition: all 0.2s ease;
                    }
                    
                    .nav-link:hover {
                        background-color: #f1f5f9;
                        color: var(--primary);
                    }
                    
                    .nav-link.active {
                        background-color: var(--primary);
                        color: white;
                        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
                    }
                    
                    .sidebar-footer {
                        padding: 24px 16px;
                        border-top: 1px solid var(--border);
                    }
                    
                    .logout-btn {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px 14px;
                        border-radius: 12px;
                        background: transparent;
                        border: none;
                        color: #f43f5e;
                        font-weight: 700;
                        cursor: pointer;
                        width: 100%;
                        transition: 0.2s;
                    }
                    
                    .logout-btn:hover {
                        background-color: #fef2f2;
                    }
                    
                    .sidebar-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.5);
                        z-index: 999;
                    }

                    @media (max-width: 1024px) {
                        .sidebar-aside {
                            transform: translateX(-100%);
                        }
                        .sidebar-aside.mobile-open {
                            transform: translateX(0);
                        }
                    }
                `}} />
            </aside>
        </>
    );
};

export default Sidebar;
