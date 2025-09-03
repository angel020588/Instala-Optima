const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cotizacion = sequelize.define('Cotizacion', {
  folio: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fecha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombreCliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  productos: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  manoObra: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'cotizaciones',
  timestamps: true
});

module.exports = Cotizacion;