const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const { Order } = require('../models/Order');
const { protect, admin } = require('../middlewares/authMiddleware');
const { Op } = require('sequelize');

// All routes here require admin access
router.use(protect, admin);

// GET /api/admin/metrics - Real database analytics
router.get('/metrics', async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalUsers = await User.count();
    
    // Revenue from valid orders (exclude Cancelled)
    const validOrders = await Order.findAll({
      where: {
        status: {
          [Op.ne]: 'Cancelled',
        },
      },
      attributes: ['totalPrice'],
    });

    const totalRevenue = validOrders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
    const pendingOrders = await Order.count({ where: { status: 'Pending' } });
    const deliveredOrders = await Order.count({ where: { status: 'Delivered' } });

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      pendingOrders,
      deliveredOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users - Customer listing
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
