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
   * Buscar ruta por nombre exacto (para validar duplicados)
   */
  async findByNombre(nombre) {
    const resultados = await db.findAll('rutas', { filters: { nombre } });
    return resultados.length > 0 ? resultados[0] : null;
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
