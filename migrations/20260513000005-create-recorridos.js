'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recorridos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      ruta_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      vehiculo_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      perfil_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      creado_en: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      id_externo: {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.addIndex('recorridos', ['activo'], {
      name: 'idx_recorridos_activo',
    });
    await queryInterface.addIndex('recorridos', ['perfil_id'], {
      name: 'idx_recorridos_perfil',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('recorridos');
  },
};
