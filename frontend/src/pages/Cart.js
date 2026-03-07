import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import OrderSuccess from '../components/OrderSuccess';
import Toast from '../components/Toast';
import '../Cart.css';


const Cart = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    // Address state
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [address, setAddress] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [latestOrder, setLatestOrder] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });


    const fetchCart = React.useCallback(async () => {
        try {
            const res = await api.get(`/cart/${user.id}`);
            setCartItems(res.data.items);
            setTotalPrice(res.data.totalPrice);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching cart:', err);
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchCart();
        }
    }, [user, fetchCart]);

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await api.put(`/cart/update/${cartItemId}`, { quantity: newQuantity });
            fetchCart();
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        try {
            await api.delete(`/cart/remove/${cartItemId}`);
            fetchCart();
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault(); // Prevent form submission if called from form

        if (!address.trim()) {
            setToast({ show: true, message: 'Delivery address is required', type: 'error', duration: 1500 });
            return;
        }
        if (!contactNo.trim()) {
            setToast({ show: true, message: 'Contact number is required', type: 'error', duration: 1500 });
            return;
        }


        try {
            const res = await api.post('/orders', {
                user_id: user.id,
                address: address,
                payment_method: paymentMethod,
                contact_no: contactNo
            });
            setLatestOrder({
                id: res.data.orderId,
                address: address,
                contact_no: contactNo,
                payment_method: paymentMethod,
                total_amount: totalPrice,
                created_at: new Date().toISOString(),
                item_names: res.data.items?.map(item => `${item.name} (x${item.quantity})`).join(', ')
            });
            setShowAddressForm(false); // Close form
            setShowSuccess(true);

            // Clear cart UI immediately
            setCartItems([]);
            setTotalPrice(0);

            // Wait 3 seconds then redirect
            setTimeout(() => {
                navigate('/orders');
            }, 3000);

        } catch (err) {
            console.error('Error during checkout:', err);
            const errorMessage = err.response?.data?.message || 'Failed to place order. Please check all details.';
            setToast({ show: true, message: errorMessage, type: 'error', duration: 1500 });
        }
    };


    if (!user) return <div className="cart-page">Please login to view your cart.</div>;
    if (loading) return <div className="cart-page">Loading cart...</div>;

    return (
        <div className="cart-page dark-cart-theme container">
            <div className="cart-header-nav">
                <button onClick={() => navigate('/menu')} className="back-to-menu-btn">
                    <span className="back-arrow">←</span> Back to Menu
                </button>
            </div>
            {showSuccess && <OrderSuccess order={latestOrder} />}


            {showAddressForm && (
                <div className="checkout-overlay">
                    <div className="checkout-modal">
                        <h2>Secure Checkout</h2>
                        <form onSubmit={handleCheckout}>
                            <div className="form-group">
                                <label className="checkout-label">Delivery Address</label>
                                <textarea
                                    className="checkout-input address-textarea"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="House No, Street, Landmark, Area, City..."
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkout-label">Contact Number</label>
                                <input
                                    type="tel"
                                    className="checkout-input"
                                    value={contactNo}
                                    onChange={(e) => setContactNo(e.target.value)}
                                    placeholder="Mobile Number"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkout-label">Payment Method</label>
                                <div className="payment-options">
                                    <label className={`payment-card ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="UPI"
                                            checked={paymentMethod === 'UPI'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="payment-icon-wrap">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="payment-svg">
                                                <path d="M12 18H12.01M7 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <span className="payment-label">UPI / Scan</span>
                                    </label>
                                    <label className={`payment-card ${paymentMethod === 'COD' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <div className="payment-icon-wrap">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="payment-svg">
                                                <path d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <span className="payment-label">Cash on Delivery</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary modal-back-btn"
                                    onClick={() => setShowAddressForm(false)}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary-confirm"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="btn-spinner"></div>
                                    ) : (
                                        <>
                                            <span>Place Order & Pay</span>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <h1 className="section-title">Your Orders</h1>
            {cartItems.length === 0 ? (
                <div className="empty-cart-view reveal-up">
                    <div className="empty-cart-glow"></div>
                    <span className="empty-cart-icon">🛒</span>
                    <h2>Your cart is whisper-quiet...</h2>
                    <p>Hungry? Add some cinematic flavors to your list.</p>
                    <button onClick={() => navigate('/menu')} className="explore-btn-premium">
                        Explore Full Menu
                    </button>
                </div>
            ) : (
                <div className="cart-container">
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={item.name} />
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p>₹{item.price}</p>
                                </div>
                                <div className="quantity-controls">
                                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 6H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </button>
                                    <span className="quantity-item-count">{item.quantity}</span>
                                    <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </button>
                                </div>
                                <button className="remove-btn" onClick={() => handleRemoveItem(item.id)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h2 style={{ marginBottom: '25px', fontWeight: 700 }}>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{totalPrice}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery Charge</span>
                            <span style={{ color: '#4CAF50' }}>FREE</span>
                        </div>
                        <div className="summary-total summary-row">
                            <span>Total</span>
                            <span>₹{totalPrice}</span>
                        </div>
                        <button className="checkout-btn" onClick={() => setShowAddressForm(true)}>PROCEED TO CHECKOUT</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
