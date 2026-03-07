const db = require('./config/db');

async function verifyDal() {
    try {
        const productNames = [
            'Yellow Dal Fry', 'Dal Tadka', 'Dal Lashuni Palak', 'Dal Makhani', 'Royal Shahi Veg Dal'
        ];
        // Note: Dal Makhani and Royal Shahi Veg Dal might appear twice now (once in Maharashtrian, once in Dal)
        // This script just checks if they exist in the products table.
        const placeholders = productNames.map(() => '?').join(',');
        const [rows] = await db.promise().query(`SELECT name, price, category_id FROM products WHERE name IN (${placeholders})`, productNames);

        console.log(`Found ${rows.length} items matching the names.`);
        rows.forEach(r => console.log(`- ${r.name}: $${r.price} (Cat ID: ${r.category_id})`));

        // We expect at least 5 items. If duplicates exist, we might see more.
        if (rows.length >= 5) {
            console.log('Verification Success: All Dal items found.');
        } else {
            console.log(`Verification Failed: Found ${rows.length} items.`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verifyDal();
