const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Rol = sequelize.define('rol', {
  id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_rol: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'rol',
  timestamps: false
});

module.exports = Rol;
