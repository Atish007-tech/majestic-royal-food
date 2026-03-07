import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { generateInvoice } from '../utils/invoiceGenerator';
import Toast from '../components/Toast';
import '../pages/Orders.css';

const Orders = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

    const fetchOrders = React.useCallback(async () => {
        try {
            let res;
            if (user.role === 'admin') {
                res = await api.get('/admin/orders');
            } else {
                res = await api.get(`/orders/${user.id}`);
            }
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, fetchOrders]);

    const handleCancelOrder = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/cancel`);
            setToast({ show: true, message: 'Order cancelled successfully', type: 'success', duration: 1500 });
            fetchOrders(); 
        } catch (err) {
            console.error('Error cancelling order:', err);
            const msg = err.response?.data?.message || 'Failed to cancel order';
            setToast({ show: true, message: msg, type: 'error', duration: 1500 });
        }
    };

    if (loading) {
        return (
            <div className="orders-loading">
                <div className="spinner"></div>
                <p>Retrieving your cinematic orders...</p>
            </div>
        );
    }

    return (
        <div className="orders-page-wrapper">
            <div className="orders-container">
                <header className="orders-header">
                    <h1 className="section-title">
                        {user.role === 'admin' ? 'Master Registry' : 'Your Feast History'}
                    </h1>
                    <p className="orders-subtitle">
                        {user.role === 'admin' ? 'Overseeing all cinematic culinary journeys' : 'Revisit your past flavor expeditions'}
                    </p>
                </header>

                {orders.length === 0 ? (
                    <div className="empty-orders-view">
                        <div className="empty-icon shadow-pulse">🍲</div>
                        <h2>No history found</h2>
                        <p>Your culinary journey is just beginning. Start your first order today!</p>
                        <button className="btn-primary-confirm" onClick={() => navigate('/menu')}>Explore Menu</button>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map(order => (
                            <div key={order.id} className="order-card-glass">
                                <div className="order-card-header">
                                    <div className="id-block">
                                        <span className="order-label">ORDER ID</span>
                                        <h3 className="order-id-num">#{order.id}</h3>
                                    </div>
                                    <div className={`status-badge ${order.status?.toLowerCase()}`}>
                                        <span className="dot"></span>
                                        {order.status ? order.status.toUpperCase() : 'UNKNOWN'}
                                    </div>
                                </div>

                                {user.role === 'admin' && (
                                    <div className="admin-user-info">
                                        <p><strong>Customer:</strong> {order.user_name}</p>
                                        <p className="user-email">{order.user_email}</p>
                                    </div>
                                )}

                                <div className="order-items-minimal">
                                    <h4 className="items-title">DELIVERED FEAST</h4>
                                    <p className="items-list">{order.item_names || 'Items details unavailable'}</p>
                                </div>

                                <div className="order-footer">
                                    <div className="price-tag">
                                        <span className="label">TOTAL</span>
                                        <span className="amount">₹{order.total_amount}</span>
                                    </div>
                                    
                                    <div className="order-meta">
                                        <span className="order-date">
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                        <span className="order-time">
                                            {order.created_at ? new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-actions-row">
                                    {user.role !== 'admin' && order.status === 'pending' && (
                                        <button
                                            className="cancel-order-btn"
                                            onClick={() => handleCancelOrder(order.id)}
                                        >
                                            Cancel Order
                                        </button>
                                    )}

                                    <button
                                        className="invoice-btn"
                                        onClick={() => generateInvoice(order, user)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                        Invoice
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {toast.show && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    duration={toast.duration} 
                    onClose={() => setToast({ ...toast, show: false })} 
                />
            )}
        </div>
    );
};

export default Orders;
