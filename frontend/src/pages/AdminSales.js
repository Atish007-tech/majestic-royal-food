import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminSales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await api.get('/admin/sales');
            setSales(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching sales:', err);
            setLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>Loading sales data...</div>;

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Sales Analytics</h1>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 700 }}>
                    Total Sales: ₹{sales.reduce((acc, sale) => acc + parseFloat(sale.amount), 0).toFixed(2)}
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: 700 }}>Sale ID</th>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: 700 }}>Product Details</th>
                            <th style={{ padding: '15px', textAlign: 'center', fontWeight: 700 }}>Quantity</th>
                            <th style={{ padding: '15px', textAlign: 'right', fontWeight: 700 }}>Amount</th>
                            <th style={{ padding: '15px', textAlign: 'center', fontWeight: 700 }}>Payment Method</th>
                            <th style={{ padding: '15px', textAlign: 'right', fontWeight: 700 }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No sales recorded yet.</td>
                            </tr>
                        ) : (
                            sales.map(sale => (
                                <tr key={sale.sale_id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', fontWeight: 600, color: 'var(--primary)' }}>#{sale.sale_id}</td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 700 }}>{sale.product_name}</div>
                                        <small style={{ color: '#888' }}>ID: {sale.product_id}</small>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: 600 }}>{sale.quantity}</td>
                                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 700, color: '#2e7d32' }}>₹{parseFloat(sale.amount).toFixed(2)}</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: sale.payment_method === 'UPI' ? '#E3F2FD' : '#F5F5F5',
                                            color: sale.payment_method === 'UPI' ? '#1976D2' : '#616161',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '700'
                                        }}>
                                            {sale.payment_method}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'right', color: '#666', fontSize: '0.9rem' }}>
                                        {new Date(sale.created_at).toLocaleDateString()}<br />
                                        <small>{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSales;
