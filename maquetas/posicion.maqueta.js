const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Posicion = sequelize.define('posicion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  vehiculo_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  lat: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  lon: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'posicion',
  timestamps: false
});

module.exports = Posicion;
