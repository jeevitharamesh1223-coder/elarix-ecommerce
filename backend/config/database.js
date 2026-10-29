const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const storagePath = process.env.SQLITE_STORAGE_PATH || path.join(__dirname, '..', 'elarix.sqlite');

// Ensure directory for SQLite database exists if a custom path is configured
const storageDir = path.dirname(storagePath);
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false,
});

module.exports = sequelize;
