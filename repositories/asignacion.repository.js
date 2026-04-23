// repositories/asignacion.repository.js
// ============================================================
// Capa de datos para tablas 'conductor_vehiculo' y 'vehiculo_ruta'
// ============================================================

const db = require('../config/database');

const AsignacionRepository = {
  // ==========================================
  // CONDUCTOR <-> VEHICULO
  // ==========================================

  /**
   * Listar todas las asignaciones conductor-vehículo
   */
  async findAllConductorVehiculo() {
    return db.findAll('conductor_vehiculo');
  },

  /**
   * Verificar si un conductor ya tiene vehículo asignado
   */
  async findConductorAsignado(usuario_id) {
    return db.findOne('conductor_vehiculo', {
      columns: 'id',
      filters: { usuario_id }
    });
  },

  /**
   * Verificar si un vehículo ya tiene conductor asignado
   */
  async findVehiculoConConductor(vehiculo_id) {
    return db.findOne('conductor_vehiculo', {
      columns: 'id',
      filters: { vehiculo_id }
    });
  },

  /**
   * Crear asignación conductor-vehículo
   */
  async createConductorVehiculo(usuario_id, vehiculo_id) {
    return db.insert('conductor_vehiculo', { usuario_id, vehiculo_id });
  },

  /**
   * Eliminar asignación conductor-vehículo por ID
   */
  async removeConductorVehiculo(id) {
    return db.remove('conductor_vehiculo', { id });
  },

  // ==========================================
  // VEHICULO <-> RUTA
  // ==========================================

  /**
   * Listar todas las asignaciones vehículo-ruta
   */
  async findAllVehiculoRuta() {
    return db.findAll('vehiculo_ruta');
  },

  /**
   * Verificar si un vehículo ya tiene ruta asignada
   */
  async findVehiculoConRuta(vehiculo_id) {
    return db.findOne('vehiculo_ruta', {
      columns: 'id',
      filters: { vehiculo_id }
    });
  },

  /**
   * Verificar si una ruta ya tiene vehículo asignado
   */
  async findRutaConVehiculo(ruta_id) {
    return db.findOne('vehiculo_ruta', {
      columns: 'id',
      filters: { ruta_id }
    });
  },

  /**
   * Crear asignación vehículo-ruta
   */
  async createVehiculoRuta(vehiculo_id, ruta_id) {
    return db.insert('vehiculo_ruta', { vehiculo_id, ruta_id });
  },

  /**
   * Eliminar asignación vehículo-ruta por ID
   */
  async removeVehiculoRuta(id) {
    return db.remove('vehiculo_ruta', { id });
  }
};

module.exports = AsignacionRepository;
