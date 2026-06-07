import React from 'react';

const Card = ({ children, title, subtitle, icon, className = "", noPadding = false, extra = null }) => {
  return (
    <div className={`premium-card ${className}`}>
      {(title || icon || extra) && (
        <div className="card-header">
          <div className="header-left">
            {icon && <span className="card-icon">{icon}</span>}
            <div className="header-text">
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {extra && (
            <div className="header-right">
              {extra}
            </div>
          )}
        </div>
      )}
      <div className={`card-body ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .premium-card {
          background: var(--bg-card);
          border-radius: var(--radius-card);
          box-shadow: var(--shadow-premium);
          border: 1px solid var(--border);
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.2);
          border-color: var(--primary);
        }
        .card-header {
          padding: 24px 24px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .card-icon {
          width: 44px;
          height: 44px;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.05);
        }
        .card-title {
          font-size: 17px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }
        .card-subtitle {
          font-size: 12.5px;
          color: var(--text-muted);
          margin-top: 4px;
          font-weight: 500;
        }
        .card-body {
          padding: 0 24px 24px;
          flex: 1;
        }
        .card-body.no-padding {
          padding: 0;
        }
      `}} />
    </div>
  );
};

export default Card;
