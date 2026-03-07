const mysql = require('mysql2/promise');
require('dotenv').config();

const addAddressColumn = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Checking if address column exists...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'address'
        `, [process.env.DB_NAME]);

        if (columns.length === 0) {
            console.log('Adding address column to orders table...');
            await connection.query('ALTER TABLE orders ADD COLUMN address TEXT AFTER user_id');
            console.log('Address column added successfully.');
        } else {
            console.log('Address column already exists.');
        }

    } catch (error) {
        console.error('Error updating database:', error);
    } finally {
        await connection.end();
    }
};

addAddressColumn();
