const express = require('express');
const router = express.Router();
const { addToCart, getCartByUserId, updateCartItem, removeCartItem } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

// All cart routes are protected
router.use(authMiddleware);

router.post('/add', addToCart);
router.get('/:userId', getCartByUserId);
router.put('/update/:id', updateCartItem);
router.delete('/remove/:id', removeCartItem);

module.exports = router;
