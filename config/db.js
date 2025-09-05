const { Sequelize } = require('sequelize');

// ✅ Configuración para UltraBase de Hetzner
const sequelize = new Sequelize(
  process.env.DATABASE_URL || `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/ultrabase`,
  {
    dialect: 'postgres',
    logging: false, // Desactivar logs SQL para mantener limpia la consola
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;