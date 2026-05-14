// repositories/reporte.repository.js
const db = require('../config/database');

class ReporteRepository {
  /**
   * Crea un nuevo reporte en la base de datos
   * @param {Object} data - Datos del reporte (nombre, email, usuario_id, reporte, imagen_base64)
   * @returns {Object} Reporte creado
   */
  async create(data) {
    const query = `
      INSERT INTO reportes (nombre, email, usuario_id, reporte, imagen_base64)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      data.nombre,
      data.email,
      data.usuario_id || null, // opcional
      data.reporte,
      data.imagen_base64 || null // opcional
    ];

    const rows = await db.query(query, values);
    return rows[0];
  }

  /**
   * Obtiene todos los reportes, con la información básica del usuario (si la hay)
   */
  async findAll() {
    const query = `
      SELECT r.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido
      FROM reportes r
      LEFT JOIN usuarios u ON r.usuario_id = u.id_usuario
      ORDER BY r.creado_en DESC
    `;
    const rows = await db.query(query);
    return rows;
  }
}

module.exports = new ReporteRepository();
