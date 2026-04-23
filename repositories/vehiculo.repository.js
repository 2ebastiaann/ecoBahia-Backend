// repositories/vehiculo.repository.js
// ============================================================
// Capa de datos para la tabla 'vehiculos' (espejo local)
// ============================================================

const db = require('../config/database');

const VehiculoRepository = {
  /**
   * Obtener todos los vehículos de la BD local
   */
  async findAll() {
    return db.findAll('vehiculos');
  },

  /**
   * Guardar espejo de vehículo en BD local
   */
  async create({ id_vehiculo, placa, marca, modelo, activo = true }) {
    return db.insertNoReturn('vehiculos', {
      id_vehiculo: id_vehiculo.toString(),
      placa,
      marca: marca || 'Generico',
      modelo: modelo || 'Desconocido',
      activo
    });
  },

  /**
   * Actualizar espejo de vehículo
   */
  async update(id_vehiculo, { placa, marca, modelo }) {
    return db.update('vehiculos', { id_vehiculo: id_vehiculo.toString() }, { placa, marca, modelo });
  },

  /**
   * Eliminar espejo de vehículo
   */
  async remove(id_vehiculo) {
    return db.remove('vehiculos', { id_vehiculo: id_vehiculo.toString() });
  }
};

module.exports = VehiculoRepository;
