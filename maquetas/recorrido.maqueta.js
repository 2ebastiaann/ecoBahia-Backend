const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Recorrido = sequelize.define('Recorrido', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ruta_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  vehiculo_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  perfil_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'recorridos',
  timestamps: false
});

module.exports = Recorrido;
