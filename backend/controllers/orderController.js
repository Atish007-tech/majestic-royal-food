const db = require('../config/db');

// @desc Place a new order
// @route POST /api/orders
exports.placeOrder = async (req, res) => {
    const { user_id, address, payment_method, contact_no } = req.body;
    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    if (!address || address.trim() === '') {
        return res.status(400).json({ message: 'Delivery address is required' });
    }
    if (!contact_no || contact_no.trim() === '') {
        return res.status(400).json({ message: 'Contact number is required' });
    }


    const conn = await db.promise().getConnection();
    try {
        await conn.beginTransaction();

        // 1. Get cart items
        const [cartItems] = await conn.query(
            `SELECT cart.product_id, cart.quantity, products.name, products.price 
             FROM cart 
             JOIN products ON cart.product_id = products.id 
             WHERE cart.user_id = ?`,
            [user_id]
        );

        if (cartItems.length === 0) {
            await conn.rollback();
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // 2. Calculate total amount
        let totalAmount = 0;
        cartItems.forEach(item => {
            totalAmount += item.price * item.quantity;
        });

        // 3. Create order
        const [orderResult] = await conn.query(
            'INSERT INTO orders (user_id, total_amount, status, address, payment_method, contact_no) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, totalAmount, 'pending', address, payment_method || 'COD', contact_no]
        );
        const orderId = orderResult.insertId;

        // 4. Create order items
        const orderItemsData = cartItems.map(item => [
            orderId,
            item.product_id,
            item.quantity,
            item.price
        ]);

        await conn.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
            [orderItemsData]
        );

        // 5. Clear cart
        await conn.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

        await conn.commit();
        res.status(201).json({
            message: 'Order placed successfully',
            orderId,
            items: cartItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })) // Constructing items for response
        });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        conn.release();
    }
};

// @desc Get orders for a specific user
// @route GET /api/orders/:userId
exports.getUserOrders = async (req, res) => {
    try {
        const [orders] = await db.promise().query(
            `SELECT orders.*, 
                    GROUP_CONCAT(CONCAT(products.name, ' (x', order_items.quantity, ')') SEPARATOR ', ') as item_names
             FROM orders 
             LEFT JOIN order_items ON orders.id = order_items.order_id
             LEFT JOIN products ON order_items.product_id = products.id
             WHERE orders.user_id = ? 
             GROUP BY orders.id
             ORDER BY orders.created_at DESC`,
            [req.params.userId]
        );
        res.status(200).json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get all orders (Admin only)
// @route GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.promise().query(
            `SELECT orders.*, users.name as user_name, users.email as user_email,
                    GROUP_CONCAT(CONCAT(products.name, ' (x', order_items.quantity, ')') SEPARATOR ', ') as item_names
             FROM orders 
             JOIN users ON orders.user_id = users.id 
             LEFT JOIN order_items ON orders.id = order_items.order_id
             LEFT JOIN products ON order_items.product_id = products.id
             GROUP BY orders.id
             ORDER BY created_at DESC`
        );
        res.status(200).json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Update order status (Admin only)
// @route PUT /api/admin/orders/:id
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
        const [result] = await db.promise().query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Cancel order (User only - if pending)
// @route PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id; // From authMiddleware

        // 1. Check if order exists and belongs to user
        const [orders] = await db.promise().query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = orders[0];

        // 2. Check if status is pending
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot cancel order that is already processing or completed' });
        }

        // 3. Update status to cancelled
        await db.promise().query(
            'UPDATE orders SET status = ? WHERE id = ?',
            ['cancelled', orderId]
        );

        res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get all sales data (Admin only)
// @route GET /api/admin/sales
exports.getSales = async (req, res) => {
    try {
        const [sales] = await db.promise().query(
            `SELECT 
                order_items.id as sale_id, 
                order_items.order_id, 
                order_items.product_id, 
                products.name as product_name,
                order_items.quantity, 
                (order_items.quantity * order_items.price) as amount,
                orders.payment_method,
                orders.created_at
             FROM order_items 
             JOIN orders ON order_items.order_id = orders.id
             JOIN products ON order_items.product_id = products.id
             ORDER BY orders.created_at DESC`
        );
        res.status(200).json(sales);
    } catch (err) {
        console.error('Error fetching sales:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
// @desc Get order statistics (Admin only)
// @route GET /api/admin/orders/stats
exports.getOrderStats = async (req, res) => {
    try {
        const [stats] = await db.promise().query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
             FROM orders`
        );
        res.status(200).json(stats[0]);
    } catch (err) {
        console.error('Error fetching order stats:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
