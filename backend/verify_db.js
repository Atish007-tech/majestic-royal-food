const db = require('./config/db');

async function testConnection() {
    try {
        const [rows] = await db.promise().query('SELECT 1 as val');
        console.log('Database connection successful:', rows[0].val);
        process.exit(0);
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

testConnection();
