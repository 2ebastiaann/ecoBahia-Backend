'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Habilitar PostGIS (necesario para columnas GEOMETRY)
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "postgis";');

    await queryInterface.createTable('rutas', {
      id_rutas: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      color_hex: {
        type: Sequelize.STRING,
      },
      shape: {
        type: 'GEOMETRY',
      },
      longitud_m: {
        type: Sequelize.DECIMAL,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      perfil_id: {
        type: Sequelize.UUID,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rutas');
  },
};
