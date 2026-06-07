const { pool: db } = require('./config/db');

const seedProducts = async () => {
    const products = [];
    const categories = ['Electronics', 'Grocery', 'Household', 'Personal Care', 'Stationery'];
    
    for (let i = 1; i <= 50; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        products.push([
            `Product ${i}`,
            `Description for Product ${i} in ${category} category.`,
            (Math.random() * 1000 + 10).toFixed(2), // Price between 10 and 1010
            Math.floor(Math.random() * 100) + 1,      // Stock between 1 and 100
            10                                      // Low stock limit
        ]);
    }

    try {
        console.log('Seeding 50 products...');
        const query = 'INSERT INTO products (name, description, price, stock, low_stock_limit) VALUES ?';
        const [result] = await db.query(query, [products]);
        console.log(`Successfully added ${result.affectedRows} products.`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding products:', err);
        process.exit(1);
    }
};

seedProducts();
