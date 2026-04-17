const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la DB usando variables de entorno
const USER = process.env.DB_USER || 'postgres';
const PASSWORD = process.env.DB_PASSWORD || 'Jack#_45279*2724';
const DB = process.env.DB_NAME || 'db_app_EcoBahia';

// NOTA: Usamos localhost y el puerto del túnel SSH
const HOST = 'localhost'; // Siempre localhost para el túnel
const PORT_DB = 5432;     // Puerto local donde se abre el túnel SSH

// Escapar la contraseña para la URL de conexión
const escapedPassword = encodeURIComponent(PASSWORD);
const connectionString = `postgresql://${USER}:${escapedPassword}@${HOST}:${PORT_DB}/${DB}`;

// Inicializar Sequelize
const sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: false,
        freezeTableName: true
    }
});

// Función para probar la conexión
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error.message);
        throw error;
    }
}

module.exports = { sequelize, testConnection };
