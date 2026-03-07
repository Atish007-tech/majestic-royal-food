import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Customer'); // Default role
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password, role });
            login(res.data.user, res.data.token);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 0', minHeight: '80vh' }}>
            <div style={{
                background: 'var(--bg-card)',
                backdropFilter: 'blur(24px) saturate(150%)',
                WebkitBackdropFilter: 'blur(24px)',
                padding: '50px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                width: '100%',
                maxWidth: '480px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative'
            }}>
                <h1 style={{ fontWeight: 800, marginBottom: '10px', fontSize: '2.5rem', letterSpacing: '-1.5px', color: 'var(--secondary)' }}>Login</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontWeight: 500 }}>Welcome back! Log in to experience the future of food.</p>

                {error && <p style={{ color: '#FF3366', fontWeight: 600, marginBottom: '25px', padding: '15px', background: 'rgba(255, 51, 102, 0.1)', borderRadius: '12px', border: '1px solid rgba(255, 51, 102, 0.2)', textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: 700, marginBottom: '10px', fontSize: '0.95rem', color: 'var(--secondary)' }}>Login As</label>
                        <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <button
                                type="button"
                                onClick={() => setRole('Customer')}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: role === 'Customer' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: role === 'Customer' ? '#FFF' : 'var(--text-muted)',
                                    fontWeight: 600,
                                    boxShadow: role === 'Customer' ? '0 4px 15px rgba(0,0,0,0.3)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
                                }}
                            >Customer</button>
                            <button
                                type="button"
                                onClick={() => setRole('Admin')}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: role === 'Admin' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: role === 'Admin' ? '#FFF' : 'var(--text-muted)',
                                    fontWeight: 600,
                                    boxShadow: role === 'Admin' ? '0 4px 15px rgba(0,0,0,0.3)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
                                }}
                            >Admin</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>Email Address</label>
                        <input
                            type="email"
                            placeholder="e.g. alex@delivery.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                padding: '16px 20px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                width: '100%',
                                fontSize: '1rem',
                                color: '#FFF',
                                background: 'rgba(255, 255, 255, 0.03)',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '0 0 0 3px rgba(240, 171, 252, 0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                padding: '16px 20px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                width: '100%',
                                fontSize: '1rem',
                                color: '#FFF',
                                background: 'rgba(255, 255, 255, 0.03)',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '0 0 0 3px rgba(240, 171, 252, 0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        style={{
                            padding: '18px',
                            background: 'var(--primary-gradient)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            boxShadow: '0 8px 25px rgba(240, 171, 252, 0.3)',
                            marginTop: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
                        }}
                        onMouseOver={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 12px 30px rgba(240, 171, 252, 0.5)'; }}
                        onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 25px rgba(240, 171, 252, 0.3)'; }}
                    >Login as {role}</button>
                </form>
                {role !== 'Admin' && (
                    <p style={{ marginTop: '35px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>
                        New to FoodApp? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, marginLeft: '5px' }}>Create account</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
