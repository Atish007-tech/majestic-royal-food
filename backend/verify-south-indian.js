const db = require('./config/db');

async function verifySouthIndian() {
    try {
        const [rows] = await db.promise().query("SELECT name, price FROM products WHERE name IN ('Idli Wada', 'Dahi Vada', 'Vada Sambhar', 'Uttapa', 'Plain Dosa', 'Masala Dosa', 'Mysore Masala Dosa', 'Nilgiri Dosa')");
        if (rows.length === 8) {
            console.log('Verification Success: All 8 South Indian items found.');
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

verifySouthIndian();
