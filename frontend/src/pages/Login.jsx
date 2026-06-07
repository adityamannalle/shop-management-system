import React, { useState } from 'react';
import { api } from '../api';
import { FaStore, FaEye, FaEyeSlash, FaExclamationCircle, FaHeart } from 'react-icons/fa';
import { showToast } from '../utils';
import AuthLayout from '../layouts/AuthLayout';

const Login = ({ setUser }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', credentials);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            showToast('Access Granted. Welcome back!', 'success');
            setUser(response.user);
        } catch (err) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    return (
        <AuthLayout>
            <div className="login-card-container animate-fade">
                <div className="login-header">
                    <div className="brand-badge-premium">
                        <FaStore />
                    </div>
                    <h1 className="premium-brand-title">ADITYA RETAIL SHOP</h1>
                    <p className="premium-brand-subtitle">Smart Inventory & Billing Management</p>
                </div>

                {error && (
                    <div className="login-error">
                        <FaExclamationCircle />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="user@company.com"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={credentials.password}
                                onChange={handleChange}
                                placeholder="user password"
                                disabled={isLoading}
                            />
                            <button 
                                type="button" 
                                className="toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="login-btn">
                        {isLoading ? (
                            <span className="spinner"></span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer-premium">
                    <div className="footer-divider-elegant"></div>
                    <p className="copyright-text">&copy; {new Date().getFullYear()} SHOP MANAGEMENT SYSTEM</p>
                    <p className="developer-tag-clean">
                        DEVELOPED BY <span className="highlight-premium">ADITYA</span>
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .login-card-container {
                    background: var(--white);
                    width: 100%;
                    max-width: 420px;
                    padding: 40px 40px 32px;
                    border-radius: var(--radius-card);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                .login-header {
                    text-align: center;
                    margin-bottom: 24px;
                }
                .brand-badge-premium {
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 28px;
                    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25);
                }
                .premium-brand-title {
                    font-size: 28px;
                    font-weight: 900;
                    color: #1e293b;
                    letter-spacing: -0.02em;
                    margin-bottom: 4px;
                    background: linear-gradient(to right, #1e293b, #4f46e5);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .premium-brand-subtitle {
                    font-size: 14px;
                    font-weight: 600;
                    color: #64748b;
                    letter-spacing: 0.01em;
                }
                .login-header h1 {
                    font-size: 24px;
                    color: var(--text-dark);
                    margin-bottom: 4px;
                }
                .login-header p {
                    font-size: 14px;
                    color: var(--text-muted);
                }
                .login-error {
                    background: #fef2f2;
                    color: var(--danger);
                    padding: 12px 16px;
                    border-radius: var(--radius-std);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: var(--space-md);
                    border: 1px solid #fee2e2;
                }
                .login-form .form-group {
                    margin-bottom: var(--space-md);
                }
                .login-form label {
                    display: block;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                }
                .login-form input {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: var(--radius-std);
                    border: 1px solid var(--border);
                    font-size: 15px;
                    transition: all 0.2s ease;
                    background: #f9fafb;
                }
                .login-form input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: var(--white);
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
                }
                .password-input-wrapper {
                    position: relative;
                }
                .toggle-btn {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                }
                .login-btn {
                    width: 100%;
                    padding: 14px;
                    background: var(--primary);
                    color: var(--white);
                    border: none;
                    border-radius: var(--radius-std);
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: var(--space-sm);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
                }
                .login-btn:hover {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 15px rgba(79, 70, 229, 0.35);
                }
                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .spinner {
                    display: block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 1s ease-in-out infinite;
                    margin: 0 auto;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .login-footer-premium {
                    margin-top: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .footer-divider-elegant {
                    width: 100%;
                    height: 1px;
                    background: radial-gradient(circle, #e2e8f0 0%, transparent 100%);
                    margin-bottom: 16px;
                }
                .copyright-text {
                    font-size: 10px;
                    font-weight: 600;
                    color: #94a3b8;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .developer-tag-clean {
                    font-size: 11px;
                    font-weight: 600;
                    color: #64748b;
                    letter-spacing: 0.05em;
                }
                .highlight-premium {
                    color: var(--primary);
                    font-weight: 900;
                }
            `}} />
        </AuthLayout>
    );
};

export default Login;
