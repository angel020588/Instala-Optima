const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Nivel = sequelize.define("Nivel", {
  dispositivo: { type: DataTypes.STRING },
  porcentaje: { type: DataTypes.FLOAT },
  estado_bomba: { type: DataTypes.STRING },
}, {
  timestamps: true
});

module.exports = Nivel;