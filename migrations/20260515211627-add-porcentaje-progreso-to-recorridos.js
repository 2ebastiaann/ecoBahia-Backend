'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('recorridos', 'porcentaje_progreso', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
      comment: 'Porcentaje de avance del recorrido calculado con Turf.js'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('recorridos', 'porcentaje_progreso');
  }
};
