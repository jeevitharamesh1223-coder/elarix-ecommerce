const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING, // e.g., 'Makeup', 'Skincare'
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // e.g., 'Lipsticks', 'Face Wash'
    allowNull: false,
  },
  skinType: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  countInStock: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    allowNull: false,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  numReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  ingredients: {
    type: DataTypes.TEXT,
  },
  benefits: {
    type: DataTypes.TEXT,
  },
  howToUse: {
    type: DataTypes.TEXT,
  },
});

module.exports = Product;
