// repositories/ruta.repository.js
// ============================================================
// Capa de datos para la tabla 'rutas' (espejo local)
// ============================================================

const db = require('../config/database');

const RutaRepository = {
  /**
   * Obtener todas las rutas de la BD local
   */
  async findAll() {
    return db.findAll('rutas');
  },

  /**
   * Guardar ruta con geometría (shape) en la BD local
   */
  async create({ id_rutas, nombre, color_hex, perfil_id, activo = true, shape = null }) {
    const record = { id_rutas, nombre, color_hex, perfil_id, activo };
    if (shape) {
      record.shape = shape;
    }
    return db.insertNoReturn('rutas', record);
  }
};

module.exports = RutaRepository;
