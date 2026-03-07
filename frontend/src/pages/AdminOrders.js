import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}`, { status: newStatus });
            fetchOrders();
        } catch (err) {
            console.error('Error updating order status:', err);
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div className="container" style={{ padding: '20px' }}>
            <h1>Manage Orders</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Order ID</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>User</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Total</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Contact</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Address</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Payment</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>#{order.id}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                {order.user_name}<br />
                                <small style={{ color: '#666' }}>{order.user_email}</small>
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>₹{order.total_amount}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.contact_no || 'N/A'}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', maxWidth: '200px' }}>{order.address || 'N/A'}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <span style={{
                                    padding: '3px 7px',
                                    background: order.payment_method === 'UPI' ? '#E3F2FD' : '#F5F5F5',
                                    color: order.payment_method === 'UPI' ? '#1976D2' : '#616161',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                    {order.payment_method || 'COD'}
                                </span>
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    background: order.status === 'completed' ? '#d4edda' :
                                        order.status === 'pending' ? '#fff3cd' : '#f8d7da',
                                    color: order.status === 'completed' ? '#155724' :
                                        order.status === 'pending' ? '#856404' : '#721c24'
                                }}>
                                    {order.status}
                                </span>
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                    style={{
                                        padding: '5px',
                                        cursor: order.status === 'cancelled' ? 'not-allowed' : 'pointer',
                                        opacity: order.status === 'cancelled' ? 0.6 : 1
                                    }}
                                    disabled={order.status === 'cancelled'}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {order.status === 'cancelled' && (
                                    <div style={{ fontSize: '0.7rem', color: '#dc3545', marginTop: '3px', fontWeight: 'bold' }}>
                                        Action Disabled
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrders;
