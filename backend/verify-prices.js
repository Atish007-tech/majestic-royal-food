const db = require('./config/db');

async function verifyPrices() {
    try {
        console.log('Verifying prices...');
        const [products] = await db.promise().query("SELECT id, name, price FROM products LIMIT 10");

        let allConverted = true;
        for (const p of products) {
            console.log(`${p.name}: ${p.price}`);
            if (p.price < 20) {
                console.warn(`WARNING: Product ${p.name} has low price ${p.price}. Might not be converted.`);
                allConverted = false;
            }
        }

        if (allConverted) {
            console.log('All checked prices seem to be in INR range.');
        } else {
            console.warn('Some prices might not be converted.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error verifying prices:', err);
        process.exit(1);
    }
}

verifyPrices();
