import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { generateInvoice } from '../utils/invoiceGenerator';
import './OrderSuccess.css';

const OrderSuccess = ({ order }) => {
    const { user } = useContext(AuthContext);

    return (
        <div className="order-success-overlay">
            <div className="success-content">
                <div className="checkmark-circle">
                    <div className="checkmark"></div>
                </div>
                <h2 className="success-title">Order Placed!</h2>
                <p className="success-message">Thank you for your order.</p>

                {order && (
                    <button
                        onClick={() => generateInvoice(order, user)}
                        className="download-invoice-btn"
                        style={{
                            marginTop: '20px',
                            padding: '12px 25px',
                            background: 'white',
                            color: 'var(--primary)',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            margin: '20px auto 0',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}
                    >
                        <span>📄</span> Download Invoice
                    </button>
                )}

                <p style={{ marginTop: '20px', opacity: 0.8, fontSize: '0.9rem' }}>Redirecting to your orders...</p>
            </div>
        </div>
    );
};

export default OrderSuccess;
