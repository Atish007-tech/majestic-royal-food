import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
    // const [orders, setOrders] = useState([]); // Removed orders state
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        category_id: ''
    });

    // Fallback image URL
    const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            // setOrders(orderRes.data); // Removed orders
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setLoading(false);
        }
    };

    // handleUpdateStatus removed

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${productId}`);
                fetchAdminData();
            } catch (err) {
                console.error('Error deleting product:', err);
            }
        }
    };

    const handleEditProduct = (product) => {
        setEditingId(product.id);
        setProductForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            image: product.image || '',
            category_id: product.category_id
        });
        window.scrollTo(0, 0); // Scroll to form
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setProductForm({ name: '', description: '', price: '', image: '', category_id: '' });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, productForm);
                alert('Product updated successfully');
            } else {
                await api.post('/products', productForm);
                alert('Product added successfully');
            }
            handleCancelEdit(); // Reset form
            fetchAdminData();
        } catch (err) {
            console.error('Error saving product:', err);
            alert('Failed to save product');
        }
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = PLACEHOLDER_IMAGE;
    };

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="container" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Add and Update Products</h1>
                <a href="/admin/all-orders" style={{
                    padding: '10px 20px',
                    background: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold'
                }}>
                    Manage Orders
                </a>
            </div>

            <section style={{ marginBottom: '40px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                    {editingId && (
                        <button onClick={handleCancelEdit} style={{ padding: '5px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Cancel Edit
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '15px', maxWidth: '500px', flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <textarea
                            placeholder="Description"
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <input
                            type="number"
                            placeholder="Price (₹)"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <input
                            type="text"
                            placeholder="Image URL"
                            value={productForm.image}
                            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <select
                            value={productForm.category_id}
                            onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                            required
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <button type="submit" style={{ padding: '10px', background: editingId ? '#ffc107' : 'var(--primary)', color: editingId ? '#000' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {editingId ? 'Update Product' : 'Add Product'}
                        </button>
                    </form>

                    {/* Live Preview */}
                    <div style={{ width: '200px', textAlign: 'center' }}>
                        <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>Image Preview</p>
                        <div style={{ width: '100%', height: '150px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9' }}>
                            {productForm.image ? (
                                <img
                                    src={productForm.image}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                                    }}
                                />
                            ) : (
                                <span style={{ color: '#999' }}>No Image URL</span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ marginBottom: '40px' }}>
                <h2>Manage Products</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Price</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Image</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.id}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.name}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>₹{product.price}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    <img
                                        src={product.image || PLACEHOLDER_IMAGE}
                                        alt={product.name}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                        onError={handleImageError}
                                    />
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    <button onClick={() => handleEditProduct(product)} style={{ background: '#ffc107', color: '#000', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', marginRight: '5px' }}>Edit</button>
                                    <button onClick={() => handleDeleteProduct(product.id)} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default AdminDashboard;
