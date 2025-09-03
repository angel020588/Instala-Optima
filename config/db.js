const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE_URL || `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/ultrabase`,
  {
    dialect: 'postgres',
    logging: false, // Desactivar logs SQL para mantener limpia la consola
  }
);

module.exports = sequelize;