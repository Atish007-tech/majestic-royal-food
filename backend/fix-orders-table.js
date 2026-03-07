const mysql = require('mysql2/promise');
require('dotenv').config();

const fixOrdersTable = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- Checking Orders Table Structure ---');

        const checkColumn = async (columnName) => {
            const [columns] = await connection.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = ?
            `, [process.env.DB_NAME, columnName]);
            return columns.length > 0;
        };

        // 1. Check & Add Address
        if (!(await checkColumn('address'))) {
            console.log('Adding "address" column...');
            await connection.query('ALTER TABLE orders ADD COLUMN address TEXT AFTER user_id');
        } else {
            console.log('"address" column already exists.');
        }

        // 2. Check & Add Contact Number
        if (!(await checkColumn('contact_no'))) {
            console.log('Adding "contact_no" column...');
            await connection.query('ALTER TABLE orders ADD COLUMN contact_no VARCHAR(20) AFTER address');
        } else {
            console.log('"contact_no" column already exists.');
        }

        // 3. Check & Add Payment Method
        if (!(await checkColumn('payment_method'))) {
            console.log('Adding "payment_method" column...');
            await connection.query('ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT "COD" AFTER total_amount');
        } else {
            console.log('"payment_method" column already exists.');
        }

        console.log('--- Orders Table Fixed Successfully ---');

    } catch (error) {
        console.error('CRITICAL ERROR during database fix:', error);
    } finally {
        await connection.end();
    }
};

fixOrdersTable();
