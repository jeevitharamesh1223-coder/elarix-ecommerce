const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');
const { protect } = require('../middlewares/authMiddleware');

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  try {
    return require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (e) {
    console.error('[Payment] Failed to initialize Stripe:', e);
    return null;
  }
};

// GET /api/payment/config - Expose public config status
router.get('/config', (req, res) => {
  const stripe = getStripe();
  res.json({
    stripeConfigured: Boolean(stripe),
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    supportedMethods: [
      { id: 'Cash on Delivery', name: 'Cash on Delivery (Pay upon delivery)', active: true },
      { id: 'Stripe', name: 'Credit / Debit Card (Stripe Test Mode)', active: Boolean(stripe) },
    ],
  });
});

// POST /api/payment/create-payment-intent - Create server-side PaymentIntent
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.UserId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized for this order' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already marked as paid' });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(400).json({
        message: 'Online payment is not configured on the server. Please select Cash on Delivery or configure STRIPE_SECRET_KEY in backend .env.',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: 'inr',
      metadata: {
        orderId: order.id.toString(),
        userId: req.user.id.toString(),
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.totalPrice,
    });
  } catch (error) {
    console.error('[Payment] Error creating PaymentIntent:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payment/webhook - Secure webhook listener for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !endpointSecret) {
    return res.status(400).send('Webhook not configured');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('[Payment Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    if (orderId) {
      const order = await Order.findByPk(orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.status = 'Processing';
        order.paymentResult = {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount_received: paymentIntent.amount_received / 100,
          currency: paymentIntent.currency,
        };
        await order.save();
        console.log(`[Payment Webhook] Order #${orderId} marked as paid via webhook.`);
      }
    }
  }

  res.json({ received: true });
});

module.exports = router;
