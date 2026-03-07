const mysql = require('mysql2/promise');
require('dotenv').config();

// Hand-picked realistic food images mapped by keywords
const imageMappings = {
    'biryani': 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?auto=format&fit=crop&q=80&w=800',
    'rice': 'https://plus.unsplash.com/premium_photo-1694002013824-73c24192fc89?auto=format&fit=crop&q=80&w=800',
    'khichdi': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    'idli': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
    'vada': 'https://plus.unsplash.com/premium_photo-1694141253763-201b12b528b7?auto=format&fit=crop&q=80&w=800',
    'dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5975?auto=format&fit=crop&q=80&w=800',
    'uttapa': 'https://plus.unsplash.com/premium_photo-1694141252033-66236b283d58?auto=format&fit=crop&q=80&w=800',
    'pakoda': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=800',
    'fries': 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&q=80&w=800',
    'chilli': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800',
    'manchurian': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
    'roti': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800',
    'naan': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800',
    'paratha': 'https://images.unsplash.com/photo-1626372580459-256191b4bf15?auto=format&fit=crop&q=80&w=800',
    'kulcha': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800',
    'paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800',
    'kabab': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800',
    'tikka': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800',
    'mushroom': 'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?auto=format&fit=crop&q=80&w=800',
    'bharti': 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&q=80&w=800',
    'bharta': 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&q=80&w=800',
    'bhendi': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&q=80&w=800',
    'bhaji': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
    'dal': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&q=80&w=800',
    'pepsi': 'https://images.unsplash.com/photo-1622483767028-3f66f34a50f7?auto=format&fit=crop&q=80&w=800',
    'coca': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&q=80&w=800',
    'cola': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&q=80&w=800',
    'sprite': 'https://images.unsplash.com/photo-1622483767028-3f66f34a50f7?auto=format&fit=crop&q=80&w=800',
    'fanta': 'https://images.unsplash.com/photo-1622483767028-3f66f34a50f7?auto=format&fit=crop&q=80&w=800',
    'slice': 'https://images.unsplash.com/photo-1622483767028-3f66f34a50f7?auto=format&fit=crop&q=80&w=800',
    'maaza': 'https://images.unsplash.com/photo-1622483767028-3f66f34a50f7?auto=format&fit=crop&q=80&w=800',
    'sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800',
    'toast': 'https://images.unsplash.com/photo-1484723091792-c195662bb6db?auto=format&fit=crop&q=80&w=800',
    'chana': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
    'aloo': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
    'palak': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800',
    'veg': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    'matar': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    'kaju': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
    'gulab': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800',
    'tutti': 'https://images.unsplash.com/photo-1563805042-7684c8a9e9cb?auto=format&fit=crop&q=80&w=800'
};

const getDefaultImage = () => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800';

const matchImage = (name) => {
    const lowerName = name.toLowerCase();
    for (const [key, url] of Object.entries(imageMappings)) {
        if (lowerName.includes(key)) return url;
    }
    return getDefaultImage();
};

const updateImages = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Connected to MySQL server. Applying curated realistic photos...');

    const [products] = await connection.query('SELECT id, name FROM products WHERE name != "Ice Cream"');
    
    for (const prod of products) {
        const imageUrl = matchImage(prod.name);
        await connection.query('UPDATE products SET image = ? WHERE id = ?', [imageUrl, prod.id]);
        console.log(`Updated curated image for ${prod.name}`);
    }

    console.log('Finished assigning realistic images!');
    await connection.end();
};

updateImages().catch(err => {
    process.exit(1);
});
