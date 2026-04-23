// repositories/recorrido.repository.js
// ============================================================
// Capa de datos para la tabla 'recorridos'
// SOLO usa el adapter db — CERO dependencia a Supabase
// ============================================================

const db = require('../config/database');

const RecorridoRepository = {
  /**
   * Listar todos los recorridos, ordenados por fecha descendente
   */
  async findAll() {
    return db.findAll('recorridos', {
      order: { column: 'creado_en', ascending: false }
    });
  },

  /**
   * Listar recorridos por conductor (perfil_id)
   */
  async findByConductor(conductorId) {
    return db.findAll('recorridos', {
      filters: { perfil_id: conductorId },
      order: { column: 'creado_en', ascending: false }
    });
  },

  /**
   * Buscar un recorrido por ID
   */
  async findById(id) {
    return db.findOne('recorridos', {
      columns: 'id, activo',
      filters: { id }
    });
  },

  /**
   * Buscar recorridos activos que usen alguno de los recursos dados
   * (ruta, vehículo o conductor ya en uso)
   * WHERE activo = true AND (ruta_id = X OR vehiculo_id = Y OR perfil_id = Z)
   */
  async findActivosConflicto(ruta_id, vehiculo_id, perfil_id) {
    return db.findAllWithOr('recorridos', {
      columns: 'ruta_id, vehiculo_id, perfil_id',
      filters: { activo: true },
      orConditions: [
        { column: 'ruta_id', value: ruta_id },
        { column: 'vehiculo_id', value: vehiculo_id },
        { column: 'perfil_id', value: perfil_id }
      ]
    });
  },

  /**
   * Crear un nuevo recorrido
   */
  async create({ ruta_id, vehiculo_id, perfil_id, activo = true }) {
    return db.insert('recorridos', { ruta_id, vehiculo_id, perfil_id, activo });
  },

  /**
   * Desactivar un recorrido (activo = false)
   */
  async desactivar(id) {
    return db.update('recorridos', { id }, { activo: false });
  },

  /**
   * Activar un recorrido (activo = true)
   */
  async activar(id) {
    return db.update('recorridos', { id }, { activo: true });
  },

  /**
   * Guardar el ID externo generado por la API del profesor
   */
  async updateExterno(id, id_externo) {
    return db.update('recorridos', { id }, { id_externo });
  },

  /**
   * Obtener el ID externo de un recorrido
   */
  async findIdExterno(id) {
    const res = await db.findOne('recorridos', {
      columns: 'id_externo',
      filters: { id }
    });
    return res ? res.id_externo : null;
  }
};

module.exports = RecorridoRepository;
