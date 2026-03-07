const db = require('./config/db');

async function addIndianBreads() {
    try {
        console.log('Finding Indian Breads category...');
        const [categories] = await db.promise().query("SELECT id FROM categories WHERE name = 'Indian Breads'");

        if (categories.length === 0) {
            console.error("'Indian Breads' category not found!");
            process.exit(1);
        }

        const categoryId = categories[0].id;
        console.log(`Category ID: ${categoryId}`);

        const products = [
            { name: 'Chapati', price: 0.99, image: 'https://images.unsplash.com/photo-1506169829285-b1a7c73b318d?auto=format&fit=crop&q=80&w=800' },
            { name: 'Tandoori Roti', price: 1.50, image: 'https://images.unsplash.com/photo-1577114995804-d50d53c829e2?auto=format&fit=crop&q=80&w=800' },
            { name: 'Naan', price: 1.99, image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=800' },
            { name: 'Garlic Naan', price: 2.50, image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=800' },
            { name: 'Cheese Garlic Naan', price: 3.50, image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=800' },
            { name: 'Cheese Chilli Naan', price: 3.50, image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=800' },
            { name: 'Lachha Paratha', price: 2.99, image: 'https://images.unsplash.com/photo-1645112411993-9c84e1b590e6?auto=format&fit=crop&q=80&w=800' }
        ];

        for (const product of products) {
            console.log(`Adding ${product.name}...`);
            await db.promise().query(
                'INSERT INTO products (name, description, price, image, category_id) VALUES (?, ?, ?, ?, ?)',
                [product.name, 'Freshly baked Indian bread', product.price, product.image, categoryId]
            );
        }

        console.log('Indian Breads items added successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error adding products:', err);
        process.exit(1);
    }
}

addIndianBreads();
