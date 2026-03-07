const mysql = require('mysql2/promise');
require('dotenv').config();

const updateImages = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Connected to MySQL server.');

    const [products] = await connection.query('SELECT id, name FROM products WHERE name != "Ice Cream"');
    console.log(`Found ${products.length} products to update...`);

    for (const prod of products) {
        // Create an AI generated premium image prompt based on the exact food name
        const prompt = `${prod.name} authentic indian restaurant food photography 4k`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true`;
        
        await connection.query('UPDATE products SET image = ? WHERE id = ?', [imageUrl, prod.id]);
        console.log(`Updated image for ${prod.name}`);
    }

    console.log('Finished updating all product images!');
    await connection.end();
};

updateImages().catch(err => {
    console.error(err);
    process.exit(1);
});
