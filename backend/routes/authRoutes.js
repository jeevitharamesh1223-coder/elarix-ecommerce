const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middlewares/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretelarixkey123';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
};

// POST /api/auth/register - Register customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ where: { email: cleanEmail } });
    
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Force isAdmin: false to prevent privilege escalation via payload injection
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      isAdmin: false,
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: cleanEmail } });

    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'isAdmin', 'createdAt'],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('[Auth Profile Get Error]:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/profile - Update customer profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, password } = req.body;

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (!isValidEmail(cleanEmail)) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
      }
      if (cleanEmail !== user.email) {
        const existing = await User.findOne({ where: { email: cleanEmail } });
        if (existing) {
          return res.status(400).json({ message: 'Email is already in use by another account' });
        }
        user.email = cleanEmail;
      }
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }
      user.password = password; // triggers beforeUpdate/beforeSave hook
    }

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user.id),
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('[Auth Profile Update Error]:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/setup-admin - Secure bootstrap for first admin
router.post('/setup-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ where: { isAdmin: true } });
    const setupKey = req.headers['x-admin-setup-key'] || req.body.setupKey;
    const envKey = process.env.ADMIN_SETUP_KEY;

    if (existingAdmin && (!envKey || setupKey !== envKey)) {
      return res.status(403).json({
        message: 'Administrator account already established. Direct bootstrap is disabled for security.',
      });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Valid name, email, and password (min 6 chars) are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let adminUser = await User.findOne({ where: { email: cleanEmail } });

    if (adminUser) {
      adminUser.isAdmin = true;
      adminUser.password = password;
      await adminUser.save();
    } else {
      adminUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: password,
        isAdmin: true,
      });
    }

    res.status(201).json({
      message: 'Administrator provisioned successfully',
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin,
      token: generateToken(adminUser.id),
    });
  } catch (error) {
    console.error('[Admin Setup Error]:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
