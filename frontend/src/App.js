import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminSales from './pages/AdminSales';
import AdminStats from './pages/AdminStats';

import Menu from './pages/Menu'; // Import the new Menu page
import './Home.css'; // Import Home styles
import './Global.css';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CustomCursor from './components/CustomCursor';

const Navbar = ({ onSearchClick }) => {
  const { user, logout } = React.useContext(AuthContext);
  return (
    <nav className="dark-navbar" style={{
      padding: '1.2rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Majestic Royal Food" style={{ height: '100px', objectFit: 'contain' }} />
          </a>
          <div style={{ display: 'flex', gap: '30px' }}>
            {(!user || user.role !== 'admin') && <a href="/" className="nav-link">Home</a>}
            {(!user || user.role !== 'admin') && <a href="/menu" className="nav-link">Menu</a>}
            {user && user.role !== 'admin' && <a href="/cart" className="nav-link">Cart</a>}
            {user && <a href="/orders" className="nav-link">Orders</a>}
            {user?.role === 'admin' && <a href="/admin/dashboard" className="nav-link">Dashboard</a>}
            {user?.role === 'admin' && <a href="/admin" className="nav-link">Add and Update</a>}
            {user?.role === 'admin' && <a href="/admin/all-orders" className="nav-link">Manage Orders</a>}
            {user?.role === 'admin' && <a href="/admin/sales" className="nav-link">Sales</a>}

          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <button 
            className="nav-search-trigger" 
            title="Search Everything"
            onClick={onSearchClick}
          >
            <span className="search-glow-icon">🔍</span>
          </button>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.8rem', color: '#AAA', fontWeight: 600 }}>Hi, {user.name}</p>
              </div>
              <button
                onClick={logout}
                className="logout-btn"
                style={{
                  background: 'transparent',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <a href="/login" className="nav-link">Login</a>
              <a href="/register" style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '12px 28px',
                borderRadius: '8px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(226, 55, 68, 0.3)'
              }}>Sign Up</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    if (window.location.pathname === '/' || window.location.pathname === '/Home') {
      const element = document.getElementById('search-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Briefly flash the glow to guide the user
        element.classList.add('premium-search-flash');
        
        // Find and focus the input directly
        const searchInput = element.querySelector('.search-bar');
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 600); // Focus after scroll starts
        }
        
        setTimeout(() => element.classList.remove('premium-search-flash'), 2000);
      }
    } else {
      navigate('/?scroll=search');
    }
  };

  const handleSearchSuggestion = (term) => {
    navigate(`/menu?search=${term}`);
  };
  return (
    <AuthProvider>
        <CustomCursor />

        <Navbar onSearchClick={handleSearchClick} />
        <div style={{ paddingTop: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/cart"
              element={<ProtectedRoute><Cart /></ProtectedRoute>}
            />
            <Route
              path="/orders"
              element={<ProtectedRoute><Orders /></ProtectedRoute>}
            />
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute adminOnly={true}><AdminStats /></ProtectedRoute>}
            />
            <Route
              path="/admin"
              element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>}
            />

            <Route
              path="/admin/all-orders"
              element={<ProtectedRoute adminOnly={true}><AdminOrders /></ProtectedRoute>}
            />
            <Route
              path="/admin/sales"
              element={<ProtectedRoute adminOnly={true}><AdminSales /></ProtectedRoute>}
            />
          </Routes>
        </div>
        <Footer />
    </AuthProvider>
  );
}

export default App;
