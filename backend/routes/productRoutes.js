const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middlewares/authMiddleware');
const { Op } = require('sequelize');

// Get all products (Public) - supports ?category=... and ?keyword=...
router.get('/', async (req, res) => {
  try {
    const where = {};
    const matchOp = Product.sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
    if (req.query.category && req.query.category.trim().toLowerCase() !== 'all') {
      where.category = {
        [matchOp]: req.query.category.trim(),
      };
    }
    if (req.query.keyword && req.query.keyword.trim()) {
      where.name = {
        [matchOp]: `%${req.query.keyword.trim()}%`,
      };
    }
    const products = await Product.findAll({
      where,
      order: [['id', 'ASC']],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, image, description, category, type, skinType, price, countInStock, rating, numReviews, ingredients, benefits, howToUse } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (price === undefined || isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: 'A valid positive price is required' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Category is required (e.g. Makeup, Skincare)' });
    }
    if (!type || !type.trim()) {
      return res.status(400).json({ message: 'Product type is required (e.g. Lipsticks, Serum)' });
    }

    const product = await Product.create({
      name: name.trim(),
      image: image ? image.trim() : '/placeholder-product.svg',
      description: description ? description.trim() : '',
      category: category.trim(),
      type: type.trim(),
      skinType: skinType ? skinType.trim() : 'All',
      price: Number(price),
      countInStock: countInStock !== undefined && !isNaN(countInStock) ? Math.max(0, parseInt(countInStock, 10)) : 50,
      rating: Number(rating) || 5.0,
      numReviews: Number(numReviews) || 1,
      ingredients: ingredients ? ingredients.trim() : '',
      benefits: benefits ? benefits.trim() : '',
      howToUse: howToUse ? howToUse.trim() : '',
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, image, description, category, type, skinType, price, countInStock, rating, numReviews, ingredients, benefits, howToUse } = req.body;

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: 'Product name cannot be empty' });
      product.name = name.trim();
    }
    if (price !== undefined) {
      if (isNaN(price) || Number(price) <= 0) return res.status(400).json({ message: 'A valid positive price is required' });
      product.price = Number(price);
    }
    if (countInStock !== undefined) {
      product.countInStock = Math.max(0, parseInt(countInStock, 10) || 0);
    }
    if (category !== undefined) product.category = category.trim();
    if (type !== undefined) product.type = type.trim();
    if (skinType !== undefined) product.skinType = skinType.trim();
    if (image !== undefined) product.image = image.trim();
    if (description !== undefined) product.description = description.trim();
    if (rating !== undefined) product.rating = Number(rating);
    if (numReviews !== undefined) product.numReviews = Number(numReviews);
    if (ingredients !== undefined) product.ingredients = ingredients.trim();
    if (benefits !== undefined) product.benefits = benefits.trim();
    if (howToUse !== undefined) product.howToUse = howToUse.trim();

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product removed successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
