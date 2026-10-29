const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  itemsPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  shippingFee: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  paidAt: {
    type: DataTypes.DATE,
  },
  paymentResult: {
    type: DataTypes.JSON,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
  },
  isDelivered: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('status') === 'Delivered';
    },
  },
});

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

// Relationships
User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

module.exports = { Order, OrderItem };
