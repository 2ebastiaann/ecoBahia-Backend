'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posiciones', {
      id_posiciones: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      geom: {
        type: 'GEOMETRY(Point, 4326)',
        allowNull: false,
      },
      capturado_ts: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      recorrido_id: {
        type: Sequelize.UUID,
      },
      perfil_id: {
        type: Sequelize.UUID,
      },
      lat: {
        type: Sequelize.DOUBLE,
      },
      lon: {
        type: Sequelize.DOUBLE,
      },
    });

    await queryInterface.addIndex('posiciones', ['recorrido_id'], {
      name: 'idx_posiciones_recorrido',
    });
    await queryInterface.addIndex('posiciones', ['perfil_id'], {
      name: 'idx_posiciones_perfil',
    });
    await queryInterface.addIndex('posiciones', ['capturado_ts'], {
      name: 'idx_posiciones_ts',
    });
    // Índice espacial GIST para consultas geográficas
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_posiciones_geom ON posiciones USING GIST(geom);'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('posiciones');
  },
};
