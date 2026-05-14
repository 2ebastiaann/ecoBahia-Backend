// config/sequelize.js
// ============================================================
// Configuración de conexión para Sequelize CLI (migraciones)
// ============================================================
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'ecobahia',
    password: process.env.DB_PASSWORD || 'ecobahia_secret_2026',
    database: process.env.DB_NAME || 'ecobahia_db',
    host:     process.env.DB_HOST || 'localhost',
    port:     process.env.DB_PORT || 5432,
    dialect:  'postgres',
    logging:  console.log,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT || 5432,
    dialect:  'postgres',
    logging:  false,
  }
};
