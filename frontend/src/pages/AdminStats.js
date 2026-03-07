import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminStats = () => {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/orders/stats');
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '20px' }}>Loading statistics...</div>;

    const cardStyle = {
        background: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        textAlign: 'center',
        flex: '1',
        minWidth: '200px',
        borderBottom: '4px solid var(--primary)',
        transition: 'transform 0.3s ease'
    };

    const valueStyle = {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        margin: '10px 0',
        color: '#333'
    };

    const labelStyle = {
        fontSize: '1rem',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    };

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <h1 style={{ marginBottom: '40px', textAlign: 'center' }}>Admin Dashboard Overview</h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '25px',
                marginBottom: '40px'
            }}>
                <div style={cardStyle} className="stat-card">
                    <p style={labelStyle}>Total Orders</p>
                    <h2 style={valueStyle}>{stats.total || 0}</h2>
                </div>
                <div style={{ ...cardStyle, borderBottomColor: '#ffc107' }} className="stat-card">
                    <p style={labelStyle}>Pending Orders</p>
                    <h2 style={valueStyle}>{stats.pending || 0}</h2>
                </div>
                <div style={{ ...cardStyle, borderBottomColor: '#17a2b8' }} className="stat-card">
                    <p style={labelStyle}>Processing Orders</p>
                    <h2 style={valueStyle}>{stats.processing || 0}</h2>
                </div>
                <div style={{ ...cardStyle, borderBottomColor: '#28a745' }} className="stat-card">
                    <p style={labelStyle}>Completed Orders</p>
                    <h2 style={valueStyle}>{stats.completed || 0}</h2>
                </div>
                <div style={{ ...cardStyle, borderBottomColor: '#dc3545' }} className="stat-card">
                    <p style={labelStyle}>Cancelled Orders</p>
                    <h2 style={valueStyle}>{stats.cancelled || 0}</h2>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <a href="/admin/all-orders" style={{
                    padding: '12px 25px',
                    background: 'var(--primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 14px rgba(226, 55, 68, 0.3)'
                }}>
                    Manage All Orders
                </a>
                <a href="/admin" style={{
                    padding: '12px 25px',
                    background: '#333',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                }}>
                    Add & Update Products
                </a>
            </div>
        </div>
    );
};

export default AdminStats;
