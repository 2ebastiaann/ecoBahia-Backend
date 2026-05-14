'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehiculos', {
      id_vehiculo: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      placa: {
        type: Sequelize.STRING,
      },
      marca: {
        type: Sequelize.STRING,
      },
      modelo: {
        type: Sequelize.STRING,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      fecha_registro: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vehiculos');
  },
};
