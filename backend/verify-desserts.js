const db = require('./config/db');

async function verifyDesserts() {
    try {
        const [rows] = await db.promise().query("SELECT name, price FROM products WHERE name IN ('Ice Cream', 'Hot Gulab Jamun', 'Fried Ice Cream', 'Tutti Frutti')");
        if (rows.length === 4) {
            console.log('Verification Success: All 4 dessert items found.');
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

verifyDesserts();
