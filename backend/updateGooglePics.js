const mysql = require('mysql2/promise');
require('dotenv').config();
const google = require('googlethis');

const updateImages = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to MySQL server. Starting Google Image scraper...');

        const [products] = await connection.query('SELECT id, name FROM products WHERE name != "Ice Cream"');
        
        console.log(`Found ${products.length} products to update. This might take a while...`);

        for (const prod of products) {
            try {
                console.log(`Searching for: ${prod.name} food...`);
                const options = {
                    page: 0, 
                    safe: false, // Safe Search
                    additional_params: { 
                        hl: 'en' 
                    }
                }
                const results = await google.image(`${prod.name} food delicious`, options);
                
                if (results && results.length > 0 && results[0].url) {
                    const imageUrl = results[0].url;
                    await connection.query('UPDATE products SET image = ? WHERE id = ?', [imageUrl, prod.id]);
                    console.log(`✅ Updated image for ${prod.name}: ${imageUrl}`);
                } else {
                    console.log(`❌ No image found for ${prod.name}`);
                }
            } catch (searchErr) {
                console.error(`Error searching image for ${prod.name}:`, searchErr.message);
            }
            // Small delay to prevent being blocked by Google
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('Finished updating images from Google!');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
};

updateImages();
