const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretelarixkey123';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
      if (!req.user) {
        return res.status(401).json({ message: 'User account not found or deactivated' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
