const db = require('./config/db');

async function verifyIndianBreads() {
    try {
        const productNames = [
            'Chapati', 'Tandoori Roti', 'Naan', 'Garlic Naan',
            'Cheese Garlic Naan', 'Cheese Chilli Naan', 'Lachha Paratha'
        ];
        const placeholders = productNames.map(() => '?').join(',');
        const [rows] = await db.promise().query(`SELECT name, price FROM products WHERE name IN (${placeholders})`, productNames);

        if (rows.length === 7) {
            console.log('Verification Success: All 7 Indian Breads items found.');
            rows.forEach(r => console.log(`- ${r.name}: $${r.price}`));
        } else {
            console.log(`Verification Failed: Found ${rows.length} items.`);
            rows.forEach(r => console.log(`Found: ${r.name}`));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verifyIndianBreads();
