const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const PerfilUsuario = sequelize.define('perfil_usuario', {
  id_perfil_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nombre_usuario: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido_usuario: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'perfil_usuario',
  timestamps: false
});

module.exports = PerfilUsuario;
