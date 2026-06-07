import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import AppLayout from './layouts/AppLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Expenses from './pages/Expenses';
import SalesPerformance from './pages/SalesPerformance';

// Global Styles
import './styles/global.css';

const App = () => {
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        // Apply theme
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleSidebar = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100vh' }}>
                <div className="spinner-pro"></div>
                <style>{`
                    .spinner-pro {
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #4f46e5;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    const ProtectedRoute = ({ children, allowedRoles }) => {
        if (!user) return <Navigate to="/login" replace />;
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return <Navigate to="/" replace />;
        }
        return children;
    };

    return (
        <Router>
            <Toaster position="top-right" />
            <div id="toast-container" className="toast-notification-root"></div>
            <Routes>
                {/* Auth Route */}
                <Route path="/login" element={
                    !user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" replace />
                } />

                {/* Main App Routes */}
                <Route path="/*" element={
                    <ProtectedRoute>
                        <AppLayout 
                            user={user} 
                            setUser={setUser}
                            isMobileOpen={isMobileMenuOpen} 
                            toggleSidebar={toggleSidebar}
                            theme={theme}
                            toggleTheme={toggleTheme}
                        >
                            <Routes>
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                
                                {/* Dashboard Route (Shared) */}
                                <Route path="/dashboard" element={
                                    <ProtectedRoute allowedRoles={['admin', 'staff']}><Dashboard /></ProtectedRoute>
                                } />

                                {/* Admin Restricted Routes */}
                                <Route path="/inventory" element={
                                    <ProtectedRoute allowedRoles={['admin']}><Inventory /></ProtectedRoute>
                                } />
                                <Route path="/staff" element={
                                    <ProtectedRoute allowedRoles={['admin']}><Staff /></ProtectedRoute>
                                } />
                                <Route path="/expenses" element={
                                    <ProtectedRoute allowedRoles={['admin']}><Expenses /></ProtectedRoute>
                                } />
                                <Route path="/performance" element={
                                    <ProtectedRoute allowedRoles={['admin', 'staff']}><SalesPerformance /></ProtectedRoute>
                                } />

                                {/* Staff/Shared Routes */}
                                <Route path="/billing" element={
                                    <ProtectedRoute allowedRoles={['staff']}><Billing /></ProtectedRoute>
                                } />

                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </AppLayout>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
};

export default App;
