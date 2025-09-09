
const { Sequelize } = require("sequelize");

// Verifica que exista la variable antes de usarla
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("🚨 No se encontró la variable DATABASE_URL. Verifica tu entorno.");
}

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false, // puedes activar logs con true si estás depurando
});

module.exports = sequelize;
