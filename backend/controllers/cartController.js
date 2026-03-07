const db = require('../config/db');

// @desc Add item to cart
// @route POST /api/cart/add
exports.addToCart = async (req, res) => {
    const { user_id, product_id, quantity } = req.body;
    if (!user_id || !product_id) {
        return res.status(400).json({ message: 'User ID and Product ID are required' });
    }

    try {
        // Check if product already in cart
        const [existing] = await db.promise().query(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );

        if (existing.length > 0) {
            // Update quantity
            await db.promise().query(
                'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
                [quantity || 1, existing[0].id]
            );
            return res.status(200).json({ message: 'Cart quantity updated' });
        }

        // Insert new item
        await db.promise().query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
            [user_id, product_id, quantity || 1]
        );
        res.status(201).json({ message: 'Product added to cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get cart by user ID with total price
// @route GET /api/cart/:userId
exports.getCartByUserId = async (req, res) => {
    try {
        const [items] = await db.promise().query(
            `SELECT cart.id, cart.product_id, cart.quantity, products.name, products.price, products.image 
             FROM cart 
             JOIN products ON cart.product_id = products.id 
             WHERE cart.user_id = ?`,
            [req.params.userId]
        );

        let totalPrice = 0;
        items.forEach(item => {
            totalPrice += item.price * item.quantity;
        });

        res.status(200).json({
            items,
            totalPrice: totalPrice.toFixed(2)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Update cart item quantity
// @route PUT /api/cart/update/:id
exports.updateCartItem = async (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Valid quantity is required' });
    }

    try {
        const [result] = await db.promise().query(
            'UPDATE cart SET quantity = ? WHERE id = ?',
            [quantity, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        res.status(200).json({ message: 'Cart updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Remove item from cart
// @route DELETE /api/cart/remove/:id
exports.removeCartItem = async (req, res) => {
    try {
        const [result] = await db.promise().query('DELETE FROM cart WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        res.status(200).json({ message: 'Item removed from cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
