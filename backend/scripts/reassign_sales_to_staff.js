const { pool: db } = require('./config/db');

const reassignSales = async () => {
    try {
        console.log('Fetching staff members and bills...');
        
        // 1. Get IDs of the new staff members
        const [staff] = await db.query('SELECT id, name FROM users WHERE role = "staff" AND name LIKE "staff%"');
        
        if (staff.length === 0) {
            console.error('No staff members found. Please run the staff seeding script first.');
            process.exit(1);
        }

        const staffIds = staff.map(s => s.id);
        console.log(`Found ${staffIds.length} staff members for reassignment.`);

        // 2. Get all bills
        const [bills] = await db.query('SELECT id FROM bills');
        
        if (bills.length === 0) {
            console.log('No bills found to reassign.');
            process.exit(0);
        }

        console.log(`Reassigning ${bills.length} bills to staff members randomly...`);

        // 3. Update each bill with a random staff ID
        for (const bill of bills) {
            const randomStaffId = staffIds[Math.floor(Math.random() * staffIds.length)];
            
            await db.query(
                'UPDATE bills SET user_id = ? WHERE id = ?',
                [randomStaffId, bill.id]
            );
        }

        console.log('Successfully reassigned all sales to staff members!');
        process.exit(0);
    } catch (err) {
        console.error('Error reassigning sales:', err);
        process.exit(1);
    }
};

reassignSales();
