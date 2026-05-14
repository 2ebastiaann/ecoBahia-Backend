'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id_usuario: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      id_rol: {
        type: Sequelize.INTEGER,
        references: {
          model: 'rol',
          key: 'id_rol',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      nombre: {
        type: Sequelize.TEXT,
      },
      apellido: {
        type: Sequelize.TEXT,
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('usuarios', ['email'], {
      name: 'idx_usuarios_email',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  },
};
