const sequelize = require('./config/database');
const Product = require('./models/Product');
const User = require('./models/User');
const { Order, OrderItem } = require('./models/Order');
const bcrypt = require('bcryptjs');

const { officialProducts } = require('./scripts/initProductionDb');
const products = officialProducts;

const seedDB = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    await Product.bulkCreate(products);
    console.log('Products seeded (' + products.length + ' products added)');

    // Create admin user (beforeCreate hook hashes the password)
    await User.create({
      name: 'Admin User',
      email: 'admin@elarix.com',
      password: '123456',
      isAdmin: true,
    });
    console.log('Admin seeded (admin@elarix.com / 123456)');

    process.exit();
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
