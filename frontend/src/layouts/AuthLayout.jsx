import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        {children}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .auth-layout {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top left, #6366f1, #4f46e5);
          padding: 20px;
        }
        .auth-container {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}} />
    </div>
  );
};

export default AuthLayout;
