const mysql = require('mysql2/promise');
require('dotenv').config();

const initDB = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });

    console.log('Connected to MySQL server.');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`Database ${process.env.DB_NAME} ensured.`);

    await connection.query(`USE \`${process.env.DB_NAME}\``);

    const schema = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(255),
        category_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    `;

    // mysql2 doesn't support multiple statements by default in a single query unless enabled
    // So we'll split them or just enable it. Enabling it is easier for this one-off.
    await connection.end();

    const connectionWithMulti = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    await connectionWithMulti.query(schema);
    console.log('All tables created successfully.');

    // Seed Data
    const categoryData = [
        { name: 'Sandwiches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400' },
        { name: 'South Indian', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400' },
        { name: 'Chinese Starter', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400' },
        { name: 'Tandoori Starter', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400' },
        { name: 'Royal Main Course', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400' },
        { name: 'Maharashtrian Main Course', image: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&q=80&w=400' },
        { name: 'Dal', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400' },
        { name: 'Veggies Special', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400' },
        { name: 'Panner Special', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400' },
        { name: 'Indian Breads', image: 'https://images.unsplash.com/photo-1533777857439-da9f3ad043b3?auto=format&fit=crop&q=80&w=400' },
        { name: 'Rice and Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80&w=400' },
        { name: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1622483767028-3f66f34a50f7?auto=format&fit=crop&q=80&w=400' },
        { name: 'Dessert', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=400' }
    ];

    for (const cat of categoryData) {
        const [rows] = await connectionWithMulti.query('SELECT id FROM categories WHERE name = ?', [cat.name]);
        if (rows.length === 0) {
            console.log(`Seeding category: ${cat.name}`);
            await connectionWithMulti.query('INSERT INTO categories (name, image) VALUES (?, ?)', [cat.name, cat.image]);
        } else {
            // Update image if it exists but might be empty
            await connectionWithMulti.query('UPDATE categories SET image = ? WHERE name = ? AND (image IS NULL OR image = "")', [cat.image, cat.name]);
        }
    }

    const [existingProducts] = await connectionWithMulti.query('SELECT COUNT(*) as count FROM products');
    if (existingProducts[0].count === 0) {
        console.log('Seeding initial products...');

        // Helper to get category ID
        const getCatId = async (name) => {
            const [rows] = await connectionWithMulti.query('SELECT id FROM categories WHERE name = ?', [name]);
            return rows.length ? rows[0].id : null;
        };

        const dessertId = await getCatId('Dessert');

        if (dessertId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Ice Cream', 'Delicious dessert', 400, 'https://C:\Users\SAMARTH\Desktop\final pro/icecream.jpg', ${dessertId}),
                ('Hot Gulab Jamun', 'Delicious dessert', 320, 'https://loremflickr.com/800/600/gulab-jamun', ${dessertId}),
                ('Fried Ice Cream', 'Delicious dessert', 480, 'https://loremflickr.com/800/600/ice-cream', ${dessertId}),
                ('Tutti Frutti', 'Delicious dessert', 360, 'https://loremflickr.com/800/600/tutti%2Cfood', ${dessertId})
            `);
        }

        const riceBiryaniId = await getCatId('Rice and Biryani');
        if (riceBiryaniId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Veg Biryani', 'Aromatic rice dish', 180, 'https://loremflickr.com/800/600/biryani', ${riceBiryaniId}),
                ('Hyderabadi Biryani', 'Spicy and flavorful', 200, 'https://loremflickr.com/800/600/biryani', ${riceBiryaniId}),
                ('Paneer Biryani', 'Biryani with paneer cubes', 210, 'https://loremflickr.com/800/600/biryani', ${riceBiryaniId}),
                ('Jeera Rice', 'Aromatic rice dish', 120, 'https://loremflickr.com/800/600/jeera-rice', ${riceBiryaniId}),
                ('Steam Rice', 'Aromatic rice dish', 90, 'https://loremflickr.com/800/600/white-rice', ${riceBiryaniId}),
                ('Veg Pulao', 'Aromatic rice dish', 150, 'https://loremflickr.com/800/600/pulao', ${riceBiryaniId}),
                ('Curd Rice', 'Aromatic rice dish', 130, 'https://loremflickr.com/800/600/curd%2Cfood', ${riceBiryaniId}),
                ('Masala Rice', 'Aromatic rice dish', 140, 'https://loremflickr.com/800/600/masala%2Cfood', ${riceBiryaniId}),
                ('Dal Khichdi', 'Aromatic rice dish', 160, 'https://loremflickr.com/800/600/khichdi', ${riceBiryaniId})
            `);
        }

        const southIndianId = await getCatId('South Indian');
        if (southIndianId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Idli Wada', 'Authentic South Indian delicacy', 60, 'https://loremflickr.com/800/600/idli', ${southIndianId}),
                ('Dahi Vada', 'Authentic South Indian delicacy', 80, 'https://loremflickr.com/800/600/medu-vada', ${southIndianId}),
                ('Vada Sambhar', 'Authentic South Indian delicacy', 55, 'https://loremflickr.com/800/600/medu-vada', ${southIndianId}),
                ('Uttapa', 'Authentic South Indian delicacy', 90, 'https://loremflickr.com/800/600/uttapam', ${southIndianId}),
                ('Plain Dosa', 'Authentic South Indian delicacy', 70, 'https://loremflickr.com/800/600/dosa', ${southIndianId}),
                ('Masala Dosa', 'Authentic South Indian delicacy', 85, 'https://loremflickr.com/800/600/dosa', ${southIndianId}),
                ('Mysore Masala Dosa', 'Authentic South Indian delicacy', 95, 'https://loremflickr.com/800/600/dosa', ${southIndianId}),
                ('Nilgiri Dosa', 'Authentic South Indian delicacy', 99, 'https://loremflickr.com/800/600/dosa', ${southIndianId})
            `);
        }

        const chineseStarterId = await getCatId('Chinese Starter');
        if (chineseStarterId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Veg Pakoda', 'Delicious starter', 110, 'https://loremflickr.com/800/600/veg%2Cfood', ${chineseStarterId}),
                ('Onion Pakoda', 'Delicious starter', 120, 'https://loremflickr.com/800/600/onion%2Cfood', ${chineseStarterId}),
                ('Paneer Pakoda', 'Delicious starter', 140, 'https://loremflickr.com/800/600/paneer', ${chineseStarterId}),
                ('Masala Papad', 'Delicious starter', 100, 'https://loremflickr.com/800/600/masala%2Cfood', ${chineseStarterId}),
                ('French Fries', 'Delicious starter', 130, 'https://loremflickr.com/800/600/french-fries', ${chineseStarterId}),
                ('Peri Peri Fries', 'Delicious starter', 145, 'https://loremflickr.com/800/600/french-fries', ${chineseStarterId}),
                ('Paneer Chilli', 'Delicious starter', 150, 'https://loremflickr.com/800/600/paneer', ${chineseStarterId}),
                ('Mushroom Chilli', 'Delicious starter', 148, 'https://loremflickr.com/800/600/mushroom-curry', ${chineseStarterId}),
                ('Veg Manchurian', 'Delicious starter', 135, 'https://loremflickr.com/800/600/manchurian', ${chineseStarterId}),
                ('Crispy Chilli Baby Corn', 'Delicious starter', 142, 'https://loremflickr.com/800/600/crispy%2Cfood', ${chineseStarterId})
            `);
        }

        const indianBreadsId = await getCatId('Indian Breads');
        if (indianBreadsId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Tandoori Roti', 'Fresh Indian bread', 20, 'https://loremflickr.com/800/600/roti', ${indianBreadsId}),
                ('Butter Roti', 'Fresh Indian bread', 25, 'https://loremflickr.com/800/600/roti', ${indianBreadsId}),
                ('Plain Naan', 'Fresh Indian bread', 30, 'https://loremflickr.com/800/600/naan', ${indianBreadsId}),
                ('Butter Naan', 'Fresh Indian bread', 35, 'https://loremflickr.com/800/600/naan', ${indianBreadsId}),
                ('Garlic Naan', 'Fresh Indian bread', 40, 'https://loremflickr.com/800/600/naan', ${indianBreadsId}),
                ('Kulcha', 'Fresh Indian bread', 30, 'https://loremflickr.com/800/600/kulcha', ${indianBreadsId}),
                ('Paratha', 'Fresh Indian bread', 30, 'https://loremflickr.com/800/600/paratha', ${indianBreadsId})
            `);
        }

        const paneerSpecialId = await getCatId('Panner Special') || await getCatId('Paneer Special');
        if (paneerSpecialId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Paneer Butter Masala', 'Delicious rich curry', 560, 'https://loremflickr.com/800/600/paneer', ${paneerSpecialId}),
                ('Kadai Paneer', 'Delicious rich curry', 560, 'https://loremflickr.com/800/600/paneer', ${paneerSpecialId}),
                ('Paneer Maratha', 'Delicious rich curry', 600, 'https://loremflickr.com/800/600/paneer', ${paneerSpecialId}),
                ('Palak Paneer', 'Delicious rich curry', 520, 'https://loremflickr.com/800/600/paneer', ${paneerSpecialId}),
                ('Kaju Paneer Masala', 'Delicious rich curry', 640, 'https://loremflickr.com/800/600/paneer', ${paneerSpecialId})
            `);
        }

        const tandooriStarterId = await getCatId('Tandoori Starter');
        if (tandooriStarterId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Paneer Achari Tikka', 'Delicious tandoori starter', 160, 'https://loremflickr.com/800/600/paneer', ${tandooriStarterId}),
                ('Paneer Afghani Tikka', 'Delicious tandoori starter', 170, 'https://loremflickr.com/800/600/paneer', ${tandooriStarterId}),
                ('Paneer Malai Tikka', 'Delicious tandoori starter', 175, 'https://loremflickr.com/800/600/paneer', ${tandooriStarterId}),
                ('Hara Bhara Kabab', 'Delicious tandoori starter', 155, 'https://loremflickr.com/800/600/hara%2Cfood', ${tandooriStarterId})
            `);
        }

        const royalMainCourseId = await getCatId('Royal Main Course');
        if (royalMainCourseId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Paneer Majestic Royal', 'Royal main course delicacy', 225, 'https://loremflickr.com/800/600/paneer', ${royalMainCourseId}),
                ('Paneer Angara Handi', 'Royal main course delicacy', 230, 'https://loremflickr.com/800/600/paneer', ${royalMainCourseId}),
                ('Paneer Kalija', 'Royal main course delicacy', 235, 'https://loremflickr.com/800/600/paneer', ${royalMainCourseId}),
                ('Mushroom Moti Rassa', 'Royal main course delicacy', 220, 'https://loremflickr.com/800/600/mushroom-curry', ${royalMainCourseId}),
                ('Subz Tili Mili Keema', 'Royal main course delicacy', 240, 'https://loremflickr.com/800/600/subz%2Cfood', ${royalMainCourseId})
            `);
        }

        const maharashtrianMainCourseId = await getCatId('Maharashtrian Main Course');
        if (maharashtrianMainCourseId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Bharli Vangi', 'Maharashtrian delicacy', 160, 'https://loremflickr.com/800/600/bharli%2Cfood', ${maharashtrianMainCourseId}),
                ('Baingan Ka Bharta', 'Maharashtrian delicacy', 150, 'https://loremflickr.com/800/600/baingan%2Cfood', ${maharashtrianMainCourseId}),
                ('Kurkure Bhendi', 'Maharashtrian delicacy', 145, 'https://loremflickr.com/800/600/kurkure%2Cfood', ${maharashtrianMainCourseId}),
                ('Shev Bhaji', 'Maharashtrian delicacy', 175, 'https://loremflickr.com/800/600/shev%2Cfood', ${maharashtrianMainCourseId}),
                ('Methi Besan', 'Maharashtrian delicacy', 155, 'https://loremflickr.com/800/600/methi%2Cfood', ${maharashtrianMainCourseId}),
                ('Mataki Fry', 'Maharashtrian delicacy', 140, 'https://loremflickr.com/800/600/mataki%2Cfood', ${maharashtrianMainCourseId}),
                ('Dal Fry', 'Maharashtrian delicacy', 150, 'https://loremflickr.com/800/600/dal-fry', ${maharashtrianMainCourseId}),
                ('Dal Makhani', 'Maharashtrian delicacy', 180, 'https://loremflickr.com/800/600/dal-fry', ${maharashtrianMainCourseId}),
                ('Royal Shahi Veg Dal', 'Maharashtrian delicacy', 170, 'https://loremflickr.com/800/600/dal-fry', ${maharashtrianMainCourseId})
            `);
        }

        const coldDrinksId = await getCatId('Cold Drinks');
        if (coldDrinksId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Pepsi', 'Refreshing cold drink', 45, 'https://loremflickr.com/800/600/pepsi%2Cdrink', ${coldDrinksId}),
                ('Coca Cola', 'Refreshing cold drink', 45, 'https://loremflickr.com/800/600/coca-cola%2Cdrink', ${coldDrinksId}),
                ('Sprite', 'Refreshing cold drink', 45, 'https://loremflickr.com/800/600/sprite%2Cdrink', ${coldDrinksId}),
                ('Thumbs Up', 'Refreshing cold drink', 45, 'https://loremflickr.com/800/600/cola%2Cdrink', ${coldDrinksId}),
                ('Fanta', 'Refreshing cold drink', 45, 'https://loremflickr.com/800/600/fanta%2Cdrink', ${coldDrinksId}),
                ('Slice', 'Refreshing cold drink', 50, 'https://loremflickr.com/800/600/mango-juice%2Cdrink', ${coldDrinksId}),
                ('Maaza', 'Refreshing cold drink', 50, 'https://loremflickr.com/800/600/mango-juice%2Cdrink', ${coldDrinksId})
            `);
        }

        const dalId = await getCatId('Dal');
        if (dalId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Yellow Dal Fry', 'Delicious dal dish', 130, 'https://loremflickr.com/800/600/dal-fry', ${dalId}),
                ('Dal Tadka', 'Delicious dal dish', 150, 'https://loremflickr.com/800/600/dal-fry', ${dalId}),
                ('Dal Lashuni Palak', 'Delicious dal dish', 160, 'https://loremflickr.com/800/600/dal-fry', ${dalId}),
                ('Dal Makhani', 'Delicious dal dish', 180, 'https://loremflickr.com/800/600/dal-fry', ${dalId}),
                ('Royal Shahi Veg Dal', 'Delicious dal dish', 190, 'https://loremflickr.com/800/600/dal-fry', ${dalId})
            `);
        }

        const sandwichesId = await getCatId('Sandwiches');
        if (sandwichesId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Bread Toast', 'Delicious sandwich', 50, 'https://loremflickr.com/800/600/bread%2Cfood', ${sandwichesId}),
                ('Bread Pakoda', 'Delicious sandwich', 55, 'https://loremflickr.com/800/600/bread%2Cfood', ${sandwichesId}),
                ('Veg Coleslaw Sandwich', 'Delicious sandwich', 70, 'https://loremflickr.com/800/600/sandwich', ${sandwichesId}),
                ('Veg Grilled Sandwich', 'Delicious sandwich', 75, 'https://loremflickr.com/800/600/sandwich', ${sandwichesId}),
                ('Special Sandwich', 'Delicious sandwich', 80, 'https://loremflickr.com/800/600/sandwich', ${sandwichesId})
            `);
        }

        const veggiesSpecialId = await getCatId('Veggies Special') || await getCatId('Baggies Special');
        if (veggiesSpecialId) {
            await connectionWithMulti.query(`
                INSERT INTO products (name, description, price, image, category_id) VALUES 
                ('Chana Masala', 'Delicious vegetable dish', 520, 'https://loremflickr.com/800/600/chana%2Cfood', ${veggiesSpecialId}),
                ('Bhindi Masala', 'Delicious vegetable dish', 560, 'https://loremflickr.com/800/600/bhindi%2Cfood', ${veggiesSpecialId}),
                ('Aloo Jeera', 'Delicious vegetable dish', 480, 'https://loremflickr.com/800/600/aloo%2Cfood', ${veggiesSpecialId}),
                ('Plain Palak', 'Delicious vegetable dish', 440, 'https://loremflickr.com/800/600/plain%2Cfood', ${veggiesSpecialId}),
                ('Veg Maratha', 'Delicious vegetable dish', 600, 'https://loremflickr.com/800/600/veg%2Cfood', ${veggiesSpecialId}),
                ('Punjabi Aloo Dum', 'Delicious vegetable dish', 640, 'https://loremflickr.com/800/600/punjabi%2Cfood', ${veggiesSpecialId}),
                ('Veg Kolhapuri', 'Delicious vegetable dish', 600, 'https://loremflickr.com/800/600/veg%2Cfood', ${veggiesSpecialId}),
                ('Mix Veg', 'Delicious vegetable dish', 560, 'https://loremflickr.com/800/600/mix%2Cfood', ${veggiesSpecialId}),
                ('Veg Hyderabadi', 'Delicious vegetable dish', 640, 'https://loremflickr.com/800/600/veg%2Cfood', ${veggiesSpecialId}),
                ('Kadai Mushroom', 'Delicious vegetable dish', 680, 'https://loremflickr.com/800/600/mushroom-curry', ${veggiesSpecialId}),
                ('Mushroom Matar Masala', 'Delicious vegetable dish', 680, 'https://loremflickr.com/800/600/mushroom-curry', ${veggiesSpecialId}),
                ('Veg Kadhai', 'Delicious vegetable dish', 640, 'https://loremflickr.com/800/600/veg%2Cfood', ${veggiesSpecialId}),
                ('Kaju Kari', 'Delicious vegetable dish', 720, 'https://loremflickr.com/800/600/kaju%2Cfood', ${veggiesSpecialId})
            `);
        }
    }

    console.log('Seed data initialized.');
    await connectionWithMulti.end();
};

initDB().catch(err => {
    console.error('Error initializing database:', err);
    process.exit(1);
});
