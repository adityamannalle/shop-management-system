const { pool: db } = require('./config/db');

async function check() {
    try {
        const [products] = await db.execute('SELECT COUNT(*) as count FROM products');
        const [bills] = await db.execute('SELECT COUNT(*) as count FROM bills');
        const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
        
        console.log('--- DATABASE COUNTS ---');
        console.log('Products:', products[0].count);
        console.log('Bills:', bills[0].count);
        console.log('Users:', users[0].count);
        
        const [sampleProducts] = await db.execute('SELECT * FROM products LIMIT 5');
        console.log('Sample Products:', sampleProducts);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
}

check();
