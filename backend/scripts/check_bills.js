const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shop_db'
    });

    const [rows] = await db.execute('SELECT status, COUNT(*) as count, SUM(total_amount) as total FROM bills GROUP BY status');
    console.log(rows);
    await db.end();
}

check();
