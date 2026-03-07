const db = require('./config/db');

async function addDesserts() {
    try {
        console.log('Finding Dessert category...');
        const [categories] = await db.promise().query("SELECT id FROM categories WHERE name = 'Dessert'");

        if (categories.length === 0) {
            console.error('Dessert category not found!');
            process.exit(1);
        }

        const dessertId = categories[0].id;
        console.log(`Dessert category ID: ${dessertId}`);

        const products = [
            { name: 'Ice Cream', price: 4.99, image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&q=80&w=800' },
            { name: 'Hot Gulab Jamun', price: 3.99, image: 'https://images.unsplash.com/photo-1541781777621-af1187494f84?auto=format&fit=crop&q=80&w=800' },
            { name: 'Fried Ice Cream', price: 5.99, image: 'https://images.unsplash.com/photo-1582234032486-4f7f520785c4?auto=format&fit=crop&q=80&w=800' },
            { name: 'Tutti Frutti', price: 4.50, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800' }
        ];

        for (const product of products) {
            console.log(`Adding ${product.name}...`);
            await db.promise().query(
                'INSERT INTO products (name, description, price, image, category_id) VALUES (?, ?, ?, ?, ?)',
                [product.name, 'Delicious dessert', product.price, product.image, dessertId]
            );
        }

        console.log('Desserts added successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error adding desserts:', err);
        process.exit(1);
    }
}

addDesserts();
