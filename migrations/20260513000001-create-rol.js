'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rol', {
      id_rol: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        // GENERATED ALWAYS AS IDENTITY
      },
      nombre_rol: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    // Insertar roles iniciales
    await queryInterface.bulkInsert('rol', [
      { id_rol: 1, nombre_rol: 'administrador', descripcion: 'Administrador del sistema' },
      { id_rol: 2, nombre_rol: 'conductor', descripcion: 'Conductor de vehículo recolector' },
      { id_rol: 3, nombre_rol: 'ciudadano', descripcion: 'Ciudadano usuario de la plataforma' },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rol');
  },
};
