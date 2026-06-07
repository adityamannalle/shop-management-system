const { pool: db } = require('./config/db');

const resequenceInvoices = async () => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        console.log('Fetching all bills ordered by creation date...');
        const [bills] = await connection.query('SELECT id FROM bills ORDER BY created_at ASC');
        
        if (bills.length === 0) {
            console.log('No bills to resequence.');
            await connection.rollback();
            process.exit(0);
        }

        console.log(`Resequencing ${bills.length} bills...`);

        // 1. Temporarily disable foreign keys
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 2. Create a mapping and update both bills and bill_items
        for (let i = 0; i < bills.length; i++) {
            const oldId = bills[i].id;
            const newId = i + 1;

            if (oldId !== newId) {
                // Update bills table
                await connection.query('UPDATE bills SET id = ? WHERE id = ?', [newId, oldId]);
                // Update bill_items table (important to keep items linked)
                await connection.query('UPDATE bill_items SET bill_id = ? WHERE bill_id = ?', [newId, oldId]);
                console.log(`Resequenced: ${oldId} -> ${newId}`);
            }
        }

        // 3. Reset auto-increment
        const nextId = bills.length + 1;
        await connection.query(`ALTER TABLE bills AUTO_INCREMENT = ${nextId}`);
        
        // 4. Re-enable foreign keys
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        await connection.commit();
        console.log(`Successfully resequenced all invoices. Next invoice will be #${nextId}.`);
        process.exit(0);
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Error resequencing invoices:', err);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
};

resequenceInvoices();
