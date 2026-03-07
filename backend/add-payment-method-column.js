const mysql = require('mysql2/promise');
require('dotenv').config();

const addPaymentMethodColumn = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Checking if payment_method column exists...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'payment_method'
        `, [process.env.DB_NAME]);

        if (columns.length === 0) {
            console.log('Adding payment_method column to orders table...');
            await connection.query('ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT "COD" AFTER total_amount');
            console.log('Payment_method column added successfully.');
        } else {
            console.log('Payment_method column already exists.');
        }

    } catch (error) {
        console.error('Error updating database:', error);
    } finally {
        await connection.end();
    }
};

addPaymentMethodColumn();
