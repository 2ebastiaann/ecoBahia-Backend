const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

// Modelo para la tabla 'rutas'
const Ruta = sequelize.define('ruta', {
    id_ruta: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre de la ruta'
    },
    color_hex: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Color hexadecimal de la ruta'
    },
    shape: {
        type: DataTypes.GEOMETRY('LINESTRING', 4326),
        allowNull: false,
        comment: 'Geometría de la ruta (LINESTRING, SRID 4326)'
    },
    longitud_m: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Longitud de la ruta en metros'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la ruta está activa'
    }
}, {
    tableName: 'rutas',
    timestamps: false
});

module.exports = Ruta;

