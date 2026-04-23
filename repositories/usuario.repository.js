// repositories/usuario.repository.js
// ============================================================
// Capa de datos para la tabla 'usuarios'
// Todas las queries a la BD pasan por aquí
// ============================================================

const db = require('../config/database');

const UsuarioRepository = {
  /**
   * Buscar usuario por email
   */
  async findByEmail(email) {
    return db.findOne('usuarios', {
      columns: '*',
      filters: { email }
    });
  },

  /**
   * Buscar solo el email (para verificar existencia)
   */
  async existsByEmail(email) {
    const user = await db.findOne('usuarios', {
      columns: 'email',
      filters: { email }
    });
    return !!user;
  },

  /**
   * Buscar usuario por ID (perfil público, sin password)
   */
  async findById(id) {
    return db.findOne('usuarios', {
      columns: 'id_usuario, email, id_rol, nombre, apellido, fecha_creacion',
      filters: { id_usuario: id }
    });
  },

  /**
   * Listar todos los conductores (id_rol = 2)
   */
  async findConductores() {
    return db.findAll('usuarios', {
      columns: 'id_usuario, email, nombre, apellido',
      filters: { id_rol: 2 }
    });
  },

  /**
   * Crear un nuevo usuario
   */
  async create({ email, password_hash, id_rol, nombre, apellido }) {
    return db.insert('usuarios', { email, password_hash, id_rol, nombre, apellido });
  },

  /**
   * Actualizar usuario por ID
   */
  async update(id, updates) {
    return db.update('usuarios', { id_usuario: id }, updates);
  },

  /**
   * Eliminar usuario por ID
   */
  async remove(id) {
    return db.remove('usuarios', { id_usuario: id });
  }
};

module.exports = UsuarioRepository;
