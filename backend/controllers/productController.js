const db = require('../config/db');

// @desc Fetch all products
// @route GET /api/products
exports.getProducts = async (req, res) => {
    try {
        const [products] = await db.promise().query('SELECT * FROM products');
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Fetch single product
// @route GET /api/products/:id
exports.getProductById = async (req, res) => {
    try {
        const [products] = await db.promise().query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(products[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Add product (Admin only)
// @route POST /api/products
exports.addProduct = async (req, res) => {
    const { name, description, price, image, category_id } = req.body;
    if (!name || !price) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    try {
        const [result] = await db.promise().query(
            'INSERT INTO products (name, description, price, image, category_id) VALUES (?, ?, ?, ?, ?)',
            [name, description, price, image, category_id]
        );
        res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Update product (Admin only)
// @route PUT /api/products/:id
exports.updateProduct = async (req, res) => {
    const { name, description, price, image, category_id } = req.body;
    try {
        const [existing] = await db.promise().query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await db.promise().query(
            'UPDATE products SET name = ?, description = ?, price = ?, image = ?, category_id = ? WHERE id = ?',
            [name || existing[0].name, description || existing[0].description, price || existing[0].price, image || existing[0].image, category_id || existing[0].category_id, req.params.id]
        );
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Delete product (Admin only)
// @route DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const [result] = await db.promise().query('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
