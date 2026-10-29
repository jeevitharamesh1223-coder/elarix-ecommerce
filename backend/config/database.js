const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

let sequelize;

if (process.env.DATABASE_URL) {
  // PostgreSQL Production (Supabase, Render, etc.)
  const isLocalPostgres =
    process.env.DATABASE_URL.includes('localhost') ||
    process.env.DATABASE_URL.includes('127.0.0.1') ||
    process.env.PG_SSL === 'false';

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: isLocalPostgres
      ? {}
      : {
          ssl: {
            require: true,
            rejectUnauthorized: false, // Essential for Supabase pooled and direct connections
          },
        },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // SQLite Local Development & Testing
  const storagePath = process.env.SQLITE_STORAGE_PATH || path.join(__dirname, '..', 'elarix.sqlite');

  // Ensure directory for SQLite database exists if a custom path is configured
  const storageDir = path.dirname(storagePath);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
}

module.exports = sequelize;
