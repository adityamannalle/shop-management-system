const { pool: db } = require('./config/db');

const safeResequence = async () => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        console.log('Fetching all bills in chronological order...');
        const [bills] = await connection.query('SELECT id FROM bills ORDER BY created_at ASC');
        
        if (bills.length === 0) {
            console.log('No bills found.');
            await connection.rollback();
            process.exit(0);
        }

        console.log(`Processing ${bills.length} bills...`);

        // 1. Disable constraints
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 2. Step 1: Move all existing IDs to a safe high range to avoid collisions
        const offset = 100000;
        for (const bill of bills) {
            const oldId = bill.id;
            const tempId = oldId + offset;
            await connection.query('UPDATE bills SET id = ? WHERE id = ?', [tempId, oldId]);
            await connection.query('UPDATE bill_items SET bill_id = ? WHERE bill_id = ?', [tempId, oldId]);
        }
        console.log('Step 1 complete: All IDs moved to temporary range.');

        // 3. Step 2: Assign final sequential IDs (1, 2, 3...)
        for (let i = 0; i < bills.length; i++) {
            const tempId = bills[i].id + offset;
            const finalId = i + 1;
            await connection.query('UPDATE bills SET id = ? WHERE id = ?', [finalId, tempId]);
            await connection.query('UPDATE bill_items SET bill_id = ? WHERE bill_id = ?', [finalId, tempId]);
            if (i % 50 === 0 || i === bills.length - 1) {
                console.log(`Re-indexing progress: ${i + 1}/${bills.length}`);
            }
        }

        // 4. Reset auto-increment
        const nextId = bills.length + 1;
        await connection.query(`ALTER TABLE bills AUTO_INCREMENT = ${nextId}`);
        
        // 5. Re-enable constraints
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        await connection.commit();
        console.log(`Success! All ${bills.length} invoices re-indexed chronologically.`);
        console.log(`Next invoice will be #${nextId}.`);
        process.exit(0);
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('CRITICAL ERROR during re-indexing:', err);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
};

safeResequence();
