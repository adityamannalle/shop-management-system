import React, { useEffect, useRef, useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    const cancelBtnRef = useRef(null);
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsClosing(false);
        } else {
            setIsClosing(true);
            const timer = setTimeout(() => setShouldRender(false), 250);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        
        if (cancelBtnRef.current) {
            cancelBtnRef.current.focus();
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isOpen, onClose]);

    const handleConfirmInternal = () => {
        setIsClosing(true);
        // Small delay to show closing animation before logic executes
        setTimeout(() => {
            onConfirm();
        }, 200);
    };

    const handleCloseInternal = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    if (!shouldRender && !isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('logout-modal-overlay')) {
            handleCloseInternal();
        }
    };

    return (
        <div 
            className={`logout-modal-overlay ${isClosing ? 'closing' : ''}`} 
            onClick={handleOverlayClick}
        >
            <div 
                className={`logout-modal-container ${isClosing ? 'closing' : ''}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-icon-wrapper">
                    <div className="icon-circle">
                        <FaSignOutAlt />
                    </div>
                </div>

                <div className="modal-content">
                    <h3>Sign Out</h3>
                    <p>Are you sure you want to sign out? You will need to log back in to access your dashboard.</p>
                </div>

                <div className="modal-actions">
                    <button 
                        ref={cancelBtnRef}
                        type="button" 
                        className="btn-cancel-premium" 
                        onClick={handleCloseInternal}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="btn-signout-premium" 
                        onClick={handleConfirmInternal}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .logout-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.4);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 99999;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    animation: fadeInOverlay 0.3s ease-out forwards;
                    transition: opacity 0.25s ease-in, backdrop-filter 0.25s ease-in, -webkit-backdrop-filter 0.25s ease-in;
                }

                .logout-modal-overlay.closing {
                    opacity: 0;
                    backdrop-filter: blur(0px);
                    -webkit-backdrop-filter: blur(0px);
                }

                .logout-modal-container {
                    background: rgba(255, 255, 255, 0.95);
                    width: 90%;
                    max-width: 380px;
                    border-radius: 24px;
                    box-shadow: 
                        0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                        0 10px 10px -5px rgba(0, 0, 0, 0.04),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.5);
                    overflow: hidden;
                    padding: 32px;
                    text-align: center;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    animation: modalScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    transition: transform 0.2s ease-in, opacity 0.2s ease-in;
                }

                .logout-modal-container.closing {
                    transform: scale(0.9) translateY(10px);
                    opacity: 0;
                }

                .modal-icon-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                }

                .icon-circle {
                    width: 56px;
                    height: 56px;
                    background: #fff1f2;
                    color: #e11d48;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    box-shadow: 0 8px 16px rgba(225, 29, 72, 0.1);
                    animation: iconPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
                }

                .modal-content h3 {
                    margin: 0 0 12px;
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                }

                .modal-content p {
                    margin: 0 0 32px;
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    font-weight: 500;
                }

                .modal-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .btn-cancel-premium, .btn-signout-premium {
                    padding: 12px 16px;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                    outline: none;
                }

                .btn-cancel-premium {
                    background: #f8fafc;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                }

                .btn-cancel-premium:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                    border-color: #cbd5e1;
                }

                .btn-signout-premium {
                    background: #e11d48;
                    color: #ffffff;
                    box-shadow: 0 4px 12px rgba(225, 29, 72, 0.2);
                }

                .btn-signout-premium:hover {
                    background: #be123c;
                    box-shadow: 0 6px 20px rgba(225, 29, 72, 0.3);
                    transform: translateY(-1px);
                }

                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes modalScaleIn {
                    from { 
                        opacity: 0; 
                        transform: scale(0.95) translateY(10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1) translateY(0); 
                    }
                }

                @keyframes iconPop {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                @media (max-width: 480px) {
                    .logout-modal-container { padding: 24px; }
                    .modal-actions { grid-template-columns: 1fr; }
                    .btn-signout-premium { order: -1; }
                }
            `}} />
        </div>
    );
};

export default LogoutModal;
