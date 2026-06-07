const { pool: db } = require('./config/db');

async function test() {
    try {
        const [rows] = await db.execute('SELECT * FROM expenses ORDER BY date DESC, created_at DESC');
        console.log('Count:', rows.length);
        console.log('First Record:', rows[0]);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

test();
