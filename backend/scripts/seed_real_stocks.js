const { pool: db } = require('./config/db');

const realProducts = [
    ['Basmati Rice (5kg)', 'Premium quality long-grain rice', 450.00, 50, 10],
    ['Wheat Flour (10kg)', 'Freshly ground whole wheat flour', 380.00, 40, 5],
    ['Refined Oil (1L)', 'Heart-healthy sunflower oil', 145.00, 100, 20],
    ['Sugar (1kg)', 'Fine granulated white sugar', 45.00, 200, 30],
    ['Salt (1kg)', 'Iodized table salt', 25.00, 150, 20],
    ['Toor Dal (1kg)', 'Unpolished pigeon peas', 160.00, 80, 15],
    ['Moong Dal (1kg)', 'Split green gram yellow dal', 140.00, 75, 10],
    ['Tea Leaves (500g)', 'Strong Assam blend tea', 280.00, 60, 10],
    ['Instant Coffee (50g)', 'Pure soluble coffee powder', 195.00, 45, 8],
    ['Milk Powder (1kg)', 'Full cream dairy whitener', 420.00, 30, 5],
    ['Bathing Soap (Combo)', 'Pack of 3 beauty soaps', 125.00, 90, 15],
    ['Toothpaste (200g)', 'Cavity protection herbal paste', 95.00, 120, 20],
    ['Dishwash Liquid (500ml)', 'Lemon fresh tough grease remover', 110.00, 85, 10],
    ['Laundry Detergent (1kg)', 'Advanced stain removal powder', 180.00, 70, 12],
    ['Toilet Cleaner (750ml)', 'Disinfectant surface cleaner', 99.00, 65, 10],
    ['Floor Cleaner (1L)', 'Floral scent germ protection', 150.00, 50, 8],
    ['Shampoo (340ml)', 'Damage repair anti-hairfall', 240.00, 40, 5],
    ['Hand Wash Refill (750ml)', 'Antibacterial liquid hand wash', 135.00, 55, 10],
    ['Biscuits (Family Pack)', 'Choco-chip cookies 300g', 85.00, 150, 30],
    ['Potato Chips (100g)', 'Classic salted crispy chips', 40.00, 200, 40],
    ['Tomato Ketchup (1kg)', 'Thick and tangy fresh tomatoes', 155.00, 40, 10],
    ['Garam Masala (100g)', 'Traditional blend of spices', 85.00, 110, 15],
    ['Turmeric Powder (200g)', 'Pure naturally processed', 65.00, 120, 20],
    ['Honey (500g)', 'Pure natural forest honey', 220.00, 25, 5],
    ['Kitchen Towel (Pack 2)', 'Highly absorbent paper towels', 120.00, 45, 10]
];

const seedRealStocks = async () => {
    try {
        console.log('Clearing old products...');
        
        // Disable foreign key checks to truncate/delete safely
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('TRUNCATE TABLE bill_items');
        await db.query('TRUNCATE TABLE bills');
        await db.query('TRUNCATE TABLE products');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Seeding 25 real shop stocks...');
        const query = 'INSERT INTO products (name, description, price, stock, low_stock_limit) VALUES ?';
        const [result] = await db.query(query, [realProducts]);
        
        console.log(`Successfully added ${result.affectedRows} real products.`);
        console.log('Note: Previous bills and items were cleared to maintain database integrity.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding real stocks:', err);
        process.exit(1);
    }
};

seedRealStocks();
