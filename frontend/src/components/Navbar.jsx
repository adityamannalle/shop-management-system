import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaBell, FaUserCircle, FaMoon, FaSun, FaCheckDouble, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';
import { api } from '../api';

const Navbar = ({ user, toggleSidebar, theme, toggleTheme }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications([]);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  return (
    <nav className="top-navbar no-print">
      <div className="nav-left">
        <button className="mobile-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      <div className="nav-right">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark Mode">
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>
        
        <div className="notif-wrapper" ref={dropdownRef}>
          <button className="notif-btn" onClick={() => setIsOpen(!isOpen)}>
            <FaBell />
            {notifications.length > 0 && <span className="notif-dot">{notifications.length}</span>}
          </button>

          {isOpen && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="mark-read-btn">
                    <FaCheckDouble /> Mark Read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className={`notif-item ${n.type}`}>
                      <div className="notif-icon">
                        {n.type === 'danger' ? <FaTimesCircle /> : 
                         n.type === 'warning' ? <FaExclamationTriangle /> : 
                         <FaInfoCircle />}
                      </div>
                      <div className="notif-content">
                        <p className="notif-title">{n.title}</p>
                        <p className="notif-msg">{n.message}</p>
                        <span className="notif-time">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notif-empty">
                    <p>All caught up! ✨</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-pill">
          <div className="user-details">
            <span className="user-name">{user?.name || 'Admin User'}</span>
            <span className="user-role">{user?.role || 'Administrator'}</span>
          </div>
          <FaUserCircle className="user-avatar" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .top-navbar {
          height: 70px;
          background-color: var(--bg-card);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-md);
          position: sticky;
          top: 0;
          z-index: 900;
        }
        
        .nav-left, .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notif-wrapper {
          position: relative;
        }
        
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 20px;
          color: var(--text-main);
          cursor: pointer;
        }
        
        .theme-toggle, .notif-btn {
          background: none;
          border: none;
          font-size: 18px;
          color: var(--text-muted);
          cursor: pointer;
          position: relative;
          padding: 8px;
          border-radius: 10px;
          transition: 0.2s;
        }
        
        .theme-toggle:hover, .notif-btn:hover {
          background-color: #f1f5f9;
          color: var(--primary);
        }
        
        .notif-dot {
          position: absolute;
          top: 2px;
          right: 2px;
          background-color: #f43f5e;
          color: white;
          font-size: 9px;
          font-weight: 800;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-card);
        }

        .notif-dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          width: 320px;
          background: var(--bg-card);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          border: 1px solid var(--border);
          z-index: 1000;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .notif-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .notif-header h3 {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        .mark-read-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .notif-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notif-item {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          gap: 12px;
          transition: 0.2s;
        }

        .notif-item:hover {
          background: #f8fafc;
        }

        .notif-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notif-item.danger .notif-icon { background: #fef2f2; color: #f43f5e; }
        .notif-item.warning .notif-icon { background: #fffbeb; color: #f59e0b; }
        .notif-item.info .notif-icon { background: #eff6ff; color: #3b82f6; }

        .notif-content { flex: 1; }
        .notif-title { font-size: 13px; font-weight: 700; color: var(--text-main); margin: 0; }
        .notif-msg { font-size: 12px; color: var(--text-muted); margin: 4px 0; line-height: 1.4; }
        .notif-time { font-size: 10px; color: #94a3b8; font-weight: 600; }

        .notif-empty {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 500;
        }
        
        .user-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 6px 6px 16px;
          border: 1px solid var(--border);
          border-radius: 50px;
          background-color: var(--bg-body);
        }
        
        .user-details {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        
        .user-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
        }
        
        .user-role {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: capitalize;
        }
        
        .user-avatar {
          font-size: 32px;
          color: #cbd5e1;
        }

        @media (max-width: 1024px) {
          .mobile-toggle { display: block; }
          .user-details { display: none; }
          .top-navbar { padding: 0 var(--space-md); }
          .notif-dropdown { position: fixed; top: 70px; right: 20px; left: 20px; width: auto; }
        }
      `}} />
    </nav>
  );
};

export default Navbar;
