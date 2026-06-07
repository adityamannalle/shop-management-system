const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'shop_db'
    });

    const [rows] = await db.execute('SELECT user_id, COUNT(*) as count FROM bills GROUP BY user_id');
    console.log('Bills by User ID:');
    console.log(rows);
    
    const [users] = await db.execute('SELECT id, name, role FROM users');
    console.log('Users:');
    console.log(users);

    await db.end();
}

check();
