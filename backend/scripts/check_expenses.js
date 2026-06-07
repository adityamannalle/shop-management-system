const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shop_db'
    });

    const [rows] = await db.execute('SELECT COUNT(*) as count, SUM(amount) as total FROM expenses');
    console.log('--- EXPENSES ---');
    console.log(rows[0]);
    await db.end();
}

check();
