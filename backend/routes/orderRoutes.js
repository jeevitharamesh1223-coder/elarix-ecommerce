const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middlewares/authMiddleware');

const VALID_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// In-memory tracker for duplicate checkout request protection
const recentOrderAttempts = new Map(); // userId -> { timestamp, fingerprint }

// Create new order (Customer)
router.post('/', protect, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!shippingAddress || typeof shippingAddress !== 'object') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Shipping address object is required' });
    }

    const { name, phone, addressLine, city, state, postalCode, pincode } = shippingAddress;
    const resolvedPostalCode = (postalCode || pincode || '').toString().trim();
    const resolvedPhone = (phone || '').toString().replace(/\D/g, '');

    if (!name || !name.trim()) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Recipient name is required' });
    }
    if (!resolvedPhone || resolvedPhone.length < 10) {
      await transaction.rollback();
      return res.status(400).json({ message: 'A valid contact phone number (at least 10 digits) is required' });
    }
    if (!addressLine || !addressLine.trim()) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Street address line is required' });
    }
    if (!city || !city.trim()) {
      await transaction.rollback();
      return res.status(400).json({ message: 'City is required' });
    }
    if (!state || !state.trim()) {
      await transaction.rollback();
      return res.status(400).json({ message: 'State is required' });
    }
    if (!resolvedPostalCode) {
      await transaction.rollback();
      return res.status(400).json({ message: 'PIN / Postal code is required' });
    }

    // Duplicate checkout submission guard (prevents rapid double-clicks within 3 seconds)
    const now = Date.now();
    const userKey = req.user.id;
    const fingerprint = `${userKey}_${orderItems.length}_${resolvedPhone}_${resolvedPostalCode}`;
    const lastAttempt = recentOrderAttempts.get(userKey);

    if (lastAttempt && lastAttempt.fingerprint === fingerprint && (now - lastAttempt.timestamp < 3000)) {
      await transaction.rollback();
      return res.status(409).json({ message: 'Duplicate order detected. Please wait a moment before submitting again.' });
    }
    recentOrderAttempts.set(userKey, { timestamp: now, fingerprint });

    const selectedPaymentMethod = paymentMethod === 'Stripe' ? 'Stripe' : 'Cash on Delivery';

    if (selectedPaymentMethod === 'Stripe' && !process.env.STRIPE_SECRET_KEY) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Online card payment is not currently configured on the server. Please select Cash on Delivery.',
      });
    }

    let calculatedItemsPrice = 0;
    const itemsToCreate = [];

    for (const item of orderItems) {
      const productId = item.product || item.id;
      const qty = Number(item.qty);

      if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
        await transaction.rollback();
        return res.status(400).json({ message: `Invalid quantity specified for product ID ${productId}` });
      }

      // Query database for authoritative stock and price
      const dbProduct = await Product.findByPk(productId, { transaction });
      if (!dbProduct) {
        await transaction.rollback();
        return res.status(404).json({ message: `Product with ID ${productId} was not found` });
      }

      // Check stock availability
      const currentStock = dbProduct.countInStock !== undefined ? dbProduct.countInStock : 50;
      if (currentStock < qty) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Insufficient stock for "${dbProduct.name}". Only ${currentStock} unit(s) available.`,
        });
      }

      // Decrement inventory stock
      dbProduct.countInStock = currentStock - qty;
      await dbProduct.save({ transaction });

      const itemTotal = Number(dbProduct.price) * qty;
      calculatedItemsPrice += itemTotal;

      itemsToCreate.push({
        ProductId: dbProduct.id,
        name: dbProduct.name,
        image: dbProduct.image,
        quantity: qty,
        price: Number(dbProduct.price),
      });
    }

    // Free shipping on orders >= 500, otherwise 50
    const shippingFee = calculatedItemsPrice >= 500 ? 0 : 50;
    const discount = 0;
    const totalPrice = Number((calculatedItemsPrice + shippingFee - discount).toFixed(2));

    const cleanAddress = {
      name: name.trim(),
      phone: resolvedPhone,
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: resolvedPostalCode,
      country: 'India',
    };

    const order = await Order.create({
      UserId: req.user.id,
      shippingAddress: cleanAddress,
      paymentMethod: selectedPaymentMethod,
      itemsPrice: Number(calculatedItemsPrice.toFixed(2)),
      shippingFee,
      discount,
      totalPrice,
      isPaid: false,
      status: 'Pending',
    }, { transaction });

    for (const it of itemsToCreate) {
      it.OrderId = order.id;
      await OrderItem.create(it, { transaction });
    }

    await transaction.commit();

    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'image', 'price'], required: false }],
        },
      ],
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
});

// Get logged-in user's orders (Customer)
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { UserId: req.user.id },
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'image', 'price'], required: false }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (Admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'image', 'price'], required: false }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'image', 'price'], required: false }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Customer can only view their own order; Admin can view any order
    if (order.UserId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (Admin only)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'Delivered') {
      order.isPaid = true;
    }
    await order.save();

    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'image', 'price'] }],
        },
      ],
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify and record order payment (Customer or Admin)
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.UserId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update payment for this order' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already marked as paid' });
    }

    // Payment verification
    if (order.paymentMethod === 'Stripe') {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        return res.status(400).json({ message: 'Stripe PaymentIntent ID is required for verification' });
      }

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(400).json({ message: 'Stripe secret key is not configured on the server' });
      }

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          message: `Payment verification failed. PaymentIntent status is "${paymentIntent.status}".`,
        });
      }

      const expectedAmount = Math.round(Number(order.totalPrice) * 100);
      if (paymentIntent.amount !== expectedAmount) {
        return res.status(400).json({
          message: `Payment amount mismatch. Expected ${expectedAmount}, received ${paymentIntent.amount}.`,
        });
      }

      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'Processing';
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date().toISOString(),
        email_address: paymentIntent.receipt_email || req.user.email,
      };
      await order.save();
    } else if (order.paymentMethod === 'Cash on Delivery') {
      // Cash on Delivery can only be marked as paid by an admin upon physical delivery
      if (!req.user.isAdmin) {
        return res.status(403).json({
          message: 'Cash on Delivery can only be marked as paid by an administrator upon physical delivery',
        });
      }
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'Delivered';
      order.paymentResult = {
        id: `COD-${order.id}-${Date.now()}`,
        status: 'Collected in Person',
        update_time: new Date().toISOString(),
      };
      await order.save();
    } else {
      return res.status(400).json({ message: 'Unsupported payment method for verification' });
    }

    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'image', 'price'], required: false }],
        },
      ],
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('[Order Pay] Error verifying payment:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
