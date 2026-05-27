'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('recorridos', 'sesion_inicio', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'Timestamp de cuándo se activó la sesión actual del recorrido. Se renueva cada vez que el conductor lo activa.'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('recorridos', 'sesion_inicio');
  }
};
