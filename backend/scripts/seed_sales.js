const { pool: db } = require('./config/db');

const seedSales = async () => {
    try {
        console.log('Fetching users and products...');
        const [users] = await db.query("SELECT id, name FROM users WHERE role IN ('admin', 'staff')");
        const [products] = await db.query("SELECT id, name, price, stock FROM products");

        if (users.length === 0 || products.length === 0) {
            console.error('No users or products found. Seed users and products first.');
            process.exit(1);
        }

        console.log('Generating 150 bills over the last 60 days...');
        const paymentModes = ['Cash', 'UPI', 'Card'];
        const customerNames = ['Rahul Sharma', 'Priya Patel', 'Amit Verma', 'Sneha Reddy', 'Vikram Singh', 'Anjali Gupta', 'Deepak Kumar', 'Megha Das'];

        for (let i = 0; i < 150; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
            const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
            
            // Random date within last 60 days
            const daysAgo = Math.floor(Math.random() * 60);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');

            // Random number of items per bill (1-4)
            const itemCount = Math.floor(Math.random() * 4) + 1;
            const selectedItems = [];
            let totalAmount = 0;

            for (let j = 0; j < itemCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                
                // NEW: Skip if stock would go negative
                if (product.stock < quantity) continue;
                
                const itemPrice = parseFloat(product.price);
                const itemTotal = itemPrice * quantity;

                product.stock -= quantity; // Update local stock for subsequent items in same bill

                selectedItems.push({
                    productId: product.id,
                    quantity: quantity,
                    price: itemPrice
                });
                totalAmount += itemTotal;
            }

            const gstAmount = totalAmount * 0.18; // 18% GST simulation
            const finalTotal = totalAmount + gstAmount;

            // Insert Bill
            const [billResult] = await db.query(
                'INSERT INTO bills (user_id, customer_name, payment_method, total_amount, gst_amount, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                [user.id, customerName, paymentMode, finalTotal, gstAmount, formattedDate]
            );
            const billId = billResult.insertId;

            // Insert Bill Items
            for (const item of selectedItems) {
                await db.query(
                    'INSERT INTO bill_items (bill_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [billId, item.productId, item.quantity, item.price]
                );
                
                // Update product stock (simulating sales)
                await db.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.productId]
                );
            }
        }

        console.log('Successfully seeded 150 bills and items.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding sales:', err);
        process.exit(1);
    }
};

seedSales();
