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
   * Buscar vehículo por placa exacta (case-insensitive, para validar duplicados)
   */
  async findByPlaca(placa) {
    const placaNormalizada = placa.trim().toUpperCase();
    // Busca con la placa normalizada a mayúsculas
    const resultados = await db.findAll('vehiculos', { filters: { placa: placaNormalizada } });
    if (resultados.length > 0) return resultados[0];
    // Busca también con la placa tal como viene (por si se guardó en otro formato)
    const resultadosOriginal = await db.findAll('vehiculos', { filters: { placa: placa.trim() } });
    return resultadosOriginal.length > 0 ? resultadosOriginal[0] : null;
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
