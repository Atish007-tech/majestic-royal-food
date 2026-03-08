import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import api from '../services/api';
import Toast from '../components/Toast';

// Remove Footer from here

const Home = () => {
    const location = useLocation(); // Get current location
    const navigate = useNavigate(); // Initialize navigate
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(location.state?.selectedCategory || '');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const searchInputRef = useRef(null);

    const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image';

    useEffect(() => {
        fetchData();

        const handleMouseMove = (e) => {
            requestAnimationFrame(() => {
                setMousePos({
                    x: (e.clientX / window.innerWidth - 0.5) * 20,
                    y: (e.clientY / window.innerHeight - 0.5) * 20
                });
            });
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('scroll') === 'search') {
            const element = document.getElementById('search-section');
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('premium-search-flash');
                    
                    // Auto-focus the input
                    if (searchInputRef.current) {
                        searchInputRef.current.focus();
                    }
                    
                    setTimeout(() => element.classList.remove('premium-search-flash'), 2000);
                }, 500);
            }
        }
    }, [window.location.search]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        const revealElements = document.querySelectorAll('.reveal-up');
        revealElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [products, categories, searchTerm, selectedCategory]);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            
            // Check if API returned HTML instead of JSON (Static Site fallback bug)
            if (typeof prodRes.data === 'string' && prodRes.data.includes('<!DOCTYPE html>')) {
                throw new Error("API returned HTML");
            }
            
            // If the deployed database contains no data, fallback to static beautiful data
            if (!prodRes.data || prodRes.data.length === 0 || !catRes.data || catRes.data.length === 0) {
                 throw new Error("API returned empty array (database not seeded)");
            }

            setProducts(prodRes.data);
            setCategories(catRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data, using beautiful fallback data for showcase:', err);
            setProducts([
                { id: 1, name: 'Royal Tandoori Chicken', price: 450, category_id: 1, image: 'https://images.unsplash.com/photo-1599487405245-814bfb2f9012?w=800&q=80' },
                { id: 2, name: 'Majestic Paneer Tikka', price: 320, category_id: 1, image: 'https://images.unsplash.com/photo-1565557612117-640a2bbdb962?w=800&q=80' },
                { id: 3, name: 'Supreme Biryani', price: 550, category_id: 2, image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80' },
                { id: 4, name: 'Galactic Garlic Naan', price: 80, category_id: 3, image: 'https://images.unsplash.com/photo-1605330364024-817ee3f2df79?w=800&q=80' },
                { id: 5, name: 'Nebula Mojito', price: 210, category_id: 4, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80' },
                { id: 6, name: 'Cosmic Choco Lava', price: 250, category_id: 5, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80' }
            ]);
            setCategories([
                { id: 1, name: 'Starters' },
                { id: 2, name: 'Main Course' },
                { id: 3, name: 'Breads' },
                { id: 4, name: 'Beverages' },
                { id: 5, name: 'Desserts' }
            ]);
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                setToast({ show: true, message: 'Login required', type: 'error', duration: 1500 });
                return;
            }
            await api.post('/cart/add', { user_id: user.id, product_id: productId, quantity: 1 });
            setToast({ show: true, message: 'Delicious choice! Added to your cart.', type: 'success', duration: 1500 });
        } catch (err) {
            console.error('Error adding to cart:', err);
            setToast({ show: true, message: 'Oops! Failed to add to cart.', type: 'error', duration: 1500 });
        }

    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = PLACEHOLDER_IMAGE;
    };

    const isSearchActive = searchTerm.trim() !== '' || selectedCategory !== '';

    const featuredProducts = React.useMemo(() => {
        if (isSearchActive) return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === '' || product.category_id === parseInt(selectedCategory);
            return matchesSearch && matchesCategory;
        });

        // Get one item from first 4 categories
        const categoryMap = new Map();
        products.forEach(product => {
            if (!categoryMap.has(product.category_id) && categoryMap.size < 4) {
                categoryMap.set(product.category_id, product);
            }
        });
        return Array.from(categoryMap.values());
    }, [products, searchTerm, selectedCategory, isSearchActive]);

    if (loading) return <div className="loading">Loading products...</div>;

    return (
        <div className="home-page">
            <div className="container">
                <header className="hero-section">
                    <div className="hero-content">
                        <h1>Biting into happiness.</h1>
                        <p>Discover the best food & drinks in your city</p>
                    </div>
                    
                    {/* Parallax Floating 3D Elements */}
                    <div 
                        className="float-feature float-burger"
                        style={{ transform: `translate3d(${mousePos.x * 2}px, ${mousePos.y * 3}px, 0)` }}
                    >
                        <img src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80" alt="3D Authentic Biryani" className="rounded-float" onError={handleImageError} />
                    </div>
                    
                    <div 
                        className="float-feature float-pizza"
                        style={{ transform: `translate3d(${mousePos.x * -1.5}px, ${mousePos.y * -2.5}px, 0)` }}
                    >
                        <img src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80" alt="3D Authentic Dosa" className="rounded-float" onError={handleImageError} />
                    </div>

                    <div 
                        className="float-feature float-drink"
                        style={{ transform: `translate3d(${mousePos.x * -3}px, ${mousePos.y * 1.5}px, 0) rotate(15deg)` }}
                    >
                        <img src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80" alt="3D Authentic Paneer" className="rounded-float" />
                    </div>
                </header>

                <div id="search-section" className="filters-section reveal-up floating-search-container">
                    <div className="search-container aesthetic-glow">
                        <span className="search-icon">✨</span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search your craving..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-bar aesthetic-input"
                        />
                        <div className="search-tags">
                            <span className="tag">Trending: Biryani</span>
                        </div>
                    </div>
                </div>

                <div className="category-pills reveal-up">
                    <button 
                        className={`pill-btn ${selectedCategory === '' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('')}
                    >
                        All
                    </button>
                    {categories.slice(0, 6).map(cat => (
                        <button 
                            key={cat.id} 
                            className={`pill-btn ${selectedCategory === String(cat.id) ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(String(cat.id))}
                        >
                            {cat.name.split(' ')[0]} {/* Shorten name for mobile pill */}
                        </button>
                    ))}
                </div>

                {!isSearchActive && (
                    <div style={{ marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--secondary)' }}>Most Ordered Foods</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Popular choices from our diverse menu</p>
                    </div>
                )}

                <div className="product-grid">
                    {featuredProducts.map(product => (
                        <div key={product.id} className="food-card reveal-up">
                            <div className="card-top">
                                <span className="heart-icon">♡</span>
                            </div>
                            <div className="img-container">
                                <img
                                    src={product.image || PLACEHOLDER_IMAGE}
                                    alt={product.name}
                                    onError={handleImageError}
                                />
                            </div>
                            <div className="card-content">
                                <h3>{product.name}</h3>
                                <p className="subtitle">{categories.find(c => c.id === product.category_id)?.name || 'Food'}</p>
                                <div className="card-bottom">
                                    <span className="price">Rs.{product.price}.0</span>
                                    {isSearchActive ? (
                                        <button className="add-btn-square" onClick={() => handleAddToCart(product.id)}>+</button>
                                    ) : (
                                        <button className="add-btn-square" onClick={() => navigate('/menu', { state: { selectedCategory: product.category_id } })}>+</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
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

export default Home;
