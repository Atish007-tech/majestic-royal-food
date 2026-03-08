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

            // Check if API returned HTML instead of JSON (Static Site fallback bug)
            if (typeof prodRes.data === 'string' && prodRes.data.includes('<!DOCTYPE html>')) {
                throw new Error("API returned HTML");
            }

            // If the deployed database contains no data, fallback to static beautiful data
            if (!prodRes.data || prodRes.data.length === 0 || !catRes.data || catRes.data.length === 0) {
                 throw new Error("API returned empty array (database not seeded)");
            }

            setCategories(catRes.data);
            setProducts(prodRes.data);
            if (catRes.data.length > 0) {
                setSelectedCategoryId(catRes.data[0].id);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data, using beautiful fallback data for showcase:', err);
            const fallbackCategories = [
                { id: 1, name: 'Starters' },
                { id: 2, name: 'Main Course' },
                { id: 3, name: 'Breads' },
                { id: 4, name: 'Beverages' },
                { id: 5, name: 'Desserts' }
            ];
            setCategories(fallbackCategories);
            setProducts([
                { id: 1, name: 'Royal Tandoori Chicken', price: 450, category_id: 1, image: 'https://images.unsplash.com/photo-1599487405245-814bfb2f9012?w=800&q=80' },
                { id: 2, name: 'Majestic Paneer Tikka', price: 320, category_id: 1, image: 'https://images.unsplash.com/photo-1565557612117-640a2bbdb962?w=800&q=80' },
                { id: 3, name: 'Supreme Biryani', price: 550, category_id: 2, image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80' },
                { id: 7, name: 'Butter Chicken', price: 480, category_id: 2, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80' },
                { id: 4, name: 'Galactic Garlic Naan', price: 80, category_id: 3, image: 'https://images.unsplash.com/photo-1605330364024-817ee3f2df79?w=800&q=80' },
                { id: 5, name: 'Nebula Mojito', price: 210, category_id: 4, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80' },
                { id: 6, name: 'Cosmic Choco Lava', price: 250, category_id: 5, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80' }
            ]);
            setSelectedCategoryId(fallbackCategories[0].id);
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
