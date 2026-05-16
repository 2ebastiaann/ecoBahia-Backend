module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('posiciones', 'imagen_base64', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('posiciones', 'imagen_base64');
  }
};
