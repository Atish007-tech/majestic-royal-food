const mysql = require('mysql2/promise');
require('dotenv').config();

const updateMenuData = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Connected to Database.');

    try {
        // Add image column to categories if not exists
        const [columns] = await connection.query('SHOW COLUMNS FROM categories LIKE "image"');
        if (columns.length === 0) {
            await connection.query('ALTER TABLE categories ADD COLUMN image VARCHAR(255)');
            console.log('Added image column to categories table.');
        }

        // Categories and their premium images
        const categoryData = {
            'Sandwiches': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400',
            'South Indian': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
            'Chinese Starter': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400',
            'Tandoori Starter': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400',
            'Royal Main Course': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400',
            'Maharashtrian Main Course': 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&q=80&w=400',
            'Dal': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400',
            'Veggies Special': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400',
            'Panner Special': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400',
            'Indian Breads': 'https://images.unsplash.com/photo-1533777857439-da9f3ad043b3?auto=format&fit=crop&q=80&w=400',
            'Rice and Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80&w=400',
            'Cold Drinks': 'https://images.unsplash.com/photo-1622483767028-3f66f34a50f7?auto=format&fit=crop&q=80&w=400',
            'Dessert': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=400'
        };

        for (const [name, imageUrl] of Object.entries(categoryData)) {
            await connection.query('UPDATE categories SET image = ? WHERE name = ?', [imageUrl, name]);
            console.log(`Updated image for category: ${name}`);
        }

        // Also update some products to have nice circular images if possible
        // (Just ensure they have images)
        console.log('Category updates complete.');

    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        await connection.end();
    }
};

updateMenuData();
