import React from 'react';
import { formatCurrency } from '../utils';

const InvoicePrint = ({ bill }) => {
  // If no bill is provided, we still need to render the styles 
  // so the 'no-print' and other media rules are active globally.
  return (
    <div id="invoice-print" className="print-only">
      {bill ? (
        <div className="invoice-receipt">
          {/* Header */}
          <div className="receipt-header">
            <h1 style={{ fontSize: '32px', margin: '0', fontWeight: '900' }}>ADITYA RETAIL SHOP</h1>
            <p className="subtitle" style={{ fontSize: '12px', letterSpacing: '2px', fontWeight: '700', marginTop: '5px' }}>Official Transaction Receipt</p>
            <div className="divider"></div>
          </div>

          {/* Meta Info */}
          <div className="receipt-meta">
            <div className="meta-row">
              <span>Invoice No:</span>
              <strong>#INV-{bill.id || bill.orderId}</strong>
            </div>
            <div className="meta-row">
              <span>Date:</span>
              <span>{bill.date || new Date(bill.created_at).toLocaleString()}</span>
            </div>
            <div className="meta-row">
              <span>Sold By:</span>
              <span>{bill.staffName || bill.soldBy || 'System Admin'}</span>
            </div>
            <div className="meta-row">
              <span>Customer:</span>
              <span>{bill.customerName || bill.customer_name || 'Walk-in'}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Item Name</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {bill.items && bill.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.productName || item.name}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(parseFloat(item.price) * parseInt(item.quantity))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="receipt-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(bill.subtotal || bill.subTotal || bill.total_amount || 0)}</span>
            </div>
            {(bill.gstAmount > 0 || bill.gst_amount > 0) && (
              <div className="summary-row">
                <span>GST (18%):</span>
                <span>{formatCurrency(bill.gstAmount || bill.gst_amount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Net Payable:</span>
              <span>{formatCurrency(bill.netPayable || bill.total_amount || bill.total || 0)}</span>
            </div>
            <div className="payment-mode" style={{ marginTop: '10px', fontWeight: '800', fontSize: '12px' }}>
              PAYMENT MODE: {bill.payment_mode || bill.paymentMode || bill.paymentMethod || 'CASH'}
            </div>
          </div>

          {/* Footer */}
          <div className="receipt-footer">
            <p>Thank you for your business!</p>
            <p className="small">Visit again! This is a computer generated invoice.</p>
          </div>
        </div>
      ) : null}

      {bill && (
        <style dangerouslySetInnerHTML={{ __html: `
        @media screen {
          .print-only { display: none !important; }
        }

        @media print {
          /* Hide EVERYTHING by default */
          body * { 
            visibility: hidden !important; 
          }
          
          /* Show ONLY our invoice container and its children */
          #invoice-print, #invoice-print * { 
            visibility: visible !important; 
          }
          
          #invoice-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            display: block !important;
          }

          .invoice-receipt {
            width: 100% !important;
            padding: 20px !important;
            color: black !important;
            background: white !important;
            visibility: visible !important;
          }

          .receipt-header { text-align: center; margin-bottom: 20px; }
          .receipt-header h1 { font-size: 28px; margin: 0; font-weight: 900; }
          .receipt-header .subtitle { font-size: 14px; text-transform: uppercase; margin-top: 4px; }
          .divider { border-bottom: 2px solid black; margin-top: 10px; }

          .receipt-meta { margin-bottom: 20px; font-size: 14px; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; }

          .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .receipt-table th { text-align: left; border-bottom: 2px solid black; padding: 10px 0; font-size: 14px; font-weight: bold; }
          .receipt-table td { padding: 10px 0; font-size: 14px; border-bottom: 1px dashed #000; }

          .receipt-summary { border-top: 2px solid black; padding-top: 15px; margin-bottom: 30px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }
          .summary-row.total { font-size: 22px; font-weight: 900; margin-top: 15px; border-top: 2px solid black; padding-top: 15px; }
          .payment-mode { font-size: 12px; margin-top: 15px; font-weight: bold; text-transform: uppercase; }

          .receipt-footer { text-align: center; border-top: 1px solid black; padding-top: 30px; margin-top: 40px; }
          .receipt-footer p { margin: 0; font-size: 16px; font-weight: bold; }
          .receipt-footer .small { font-size: 12px; font-weight: normal; margin-top: 8px; opacity: 0.7; }

          .text-right { text-align: right !important; }
          .text-center { text-align: center !important; }
        }
      `}} />
      )}
    </div>
  );
};

export default InvoicePrint;
