const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shop_db'
    });

    console.log('Recent 10 Bills with User Details:');
    const [rows] = await db.execute(`
        SELECT b.id, b.user_id, u.name, u.role, b.total_amount, b.created_at 
        FROM bills b 
        LEFT JOIN users u ON b.user_id = u.id 
        ORDER BY b.id DESC LIMIT 10
    `);
    console.table(rows);

    await db.end();
}

check();
