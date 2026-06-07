import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LogoutModal from '../components/LogoutModal';
import toast from 'react-hot-toast';

const AppLayout = ({ children, user, setUser, toggleSidebar, isMobileOpen, theme, toggleTheme }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoutConfirm = () => {
    // 1. Close Modal UI immediately (this starts the exit animation)
    setIsLogoutModalOpen(false);
    
    // 2. Wait for the animation (250ms) before clearing state and unmounting
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Update global user state - this triggers the ProtectedRoute redirect
      setUser(null);
      
      // Navigate to login (as a backup/explicit step)
      navigate('/login');
    }, 250);
  };

  return (
    <div className="app-layout">
      <Sidebar 
        user={user} 
        isMobileOpen={isMobileOpen} 
        toggleSidebar={toggleSidebar} 
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />
      
      <div className="main-wrapper">
        <Navbar user={user} toggleSidebar={toggleSidebar} theme={theme} toggleTheme={toggleTheme} />
        
        <main className="main-content">
          <div className="container-pro">
            {children}
          </div>
        </main>
      </div>

      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={handleLogoutConfirm} 
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .app-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-body);
        }
        
        .main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0; /* Important for preventing grid overflow */
          margin-left: var(--sidebar-width);
          transition: margin-left 0.3s ease;
        }
        
        .main-content {
          padding-top: var(--space-sm);
          flex: 1;
        }

        @media (max-width: 1024px) {
          .main-wrapper {
            margin-left: 0;
          }
          .main-content {
            padding: var(--space-md);
          }
        }
      `}} />
    </div>
  );
};

export default AppLayout;
