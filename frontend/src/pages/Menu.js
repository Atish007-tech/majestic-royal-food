import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Toast from '../components/Toast';

// Remove Footer from here
import './Menu.css';

const Menu = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = React.useRef(null);
    const navigate = useNavigate();
    const { user } = React.useContext(AuthContext);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [searchTerm, setSearchTerm] = useState('');


    const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

    useEffect(() => {
        fetchData();
        
        // Handle search query from URL
        const params = new URLSearchParams(window.location.search);
        const term = params.get('search');
        if (term) {
            setSearchTerm(term);
        }
    }, [window.location.search]);

    const fetchData = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                api.get('/categories'),
                api.get('/products')
            ]);
            setCategories(catRes.data);
            setProducts(prodRes.data);
            if (catRes.data.length > 0) {
                setSelectedCategoryId(catRes.data[0].id);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setLoading(false);
        }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.6; // Scroll by 60% of container width
            scrollRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleAddToCart = async (productId, e) => {
        e.stopPropagation(); // Prevent card click
        try {
            if (!user) {
                setToast({ show: true, message: 'Login required', type: 'error', duration: 1500 });
                return;
            }
            await api.post('/cart/add', { user_id: user.id, product_id: productId, quantity: 1 });
            setToast({ show: true, message: 'Delicious choice! Added to your cart.', type: 'success', duration: 1500 });
        } catch (err) {
            console.error('Error adding to cart:', err);
            setToast({ show: true, message: 'Failed to add to cart', type: 'error', duration: 1500 });
        }
    };


    const activeCategory = categories.find(c => c.id === selectedCategoryId);
    const filteredProducts = products.filter(p => {
        if (searchTerm) {
            return p.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return p.category_id === selectedCategoryId;
    });

    if (loading) return <div className="loading">Loading Menu...</div>;

    return (
        <div className="menu-page-wrapper">
            <div className="menu-container">
                <header className="menu-header-bar">
                    <div className="nav-controls">
                        <button className="scroll-btn prev" onClick={() => scroll('left')}>❮</button>
                        <div className="menu-nav" ref={scrollRef}>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={`menu-nav-item ${selectedCategoryId === category.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategoryId(category.id)}
                                >
                                    {category.name.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button className="scroll-btn next" onClick={() => scroll('right')}>❯</button>
                    </div>
                    <button className="menu-close-btn" onClick={() => navigate('/')}>×</button>
                </header>

                <div className="menu-search-overkill">
                    <div className="search-container aesthetic-glow">
                        <span className="search-icon">✨</span>
                        <input
                            type="text"
                            placeholder="Search in this menu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-bar aesthetic-input"
                        />
                    </div>
                </div>

                <div className="menu-content-area">
                    <h2 className="active-category-title">{activeCategory?.name.toUpperCase()}</h2>
                    <div className="menu-items-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <div key={product.id} className="menu-item-card">
                                    <div className="menu-item-image-wrapper">
                                        <img
                                            src={product.image || PLACEHOLDER_IMAGE}
                                            alt={product.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = PLACEHOLDER_IMAGE;
                                            }}
                                        />
                                    </div>
                                    <div className="menu-item-info">
                                        <h3 className="menu-item-name">{product.name}</h3>
                                        <div className="menu-item-footer">
                                            <span className="menu-item-price">₹{product.price}</span>
                                            <button className="add-to-cart-small" onClick={(e) => handleAddToCart(product.id, e)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            ))

                        ) : (
                            <p className="no-items">No items found for this category.</p>
                        )}
                    </div>
                </div>

                <div className="menu-footer-actions">
                    <button className="btn-secondary" onClick={() => navigate('/')}>MORE FAVORITES</button>
                    <button className="btn-primary" onClick={() => navigate('/cart')}>VIEW CART</button>
                </div>
            </div>

            <div className="bottom-search-bar reveal-up">
                <div className="search-container aesthetic-glow-bottom">
                     <span className="search-icon">🌌</span>
                     <input
                        type="text"
                        placeholder="Find more delicacies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-bar aesthetic-input"
                    />
                </div>
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

export default Menu;
