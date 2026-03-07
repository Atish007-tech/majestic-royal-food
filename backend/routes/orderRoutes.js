const express = require('express');
const router = express.Router();
const { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, cancelOrder, getSales, getOrderStats } = require('../controllers/orderController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// User routes
router.post('/orders', authMiddleware, placeOrder);
router.get('/orders/:userId', authMiddleware, getUserOrders);
router.put('/orders/:id/cancel', authMiddleware, cancelOrder);

// Admin routes
router.get('/admin/orders', authMiddleware, adminMiddleware, getAllOrders);
router.get('/admin/sales', authMiddleware, adminMiddleware, getSales);
router.get('/admin/orders/stats', authMiddleware, adminMiddleware, getOrderStats);
router.put('/admin/orders/:id', authMiddleware, adminMiddleware, updateOrderStatus);


module.exports = router;
