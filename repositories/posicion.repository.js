// repositories/posicion.repository.js
// ============================================================
// Capa de datos para la tabla 'posiciones'
// Gestiona las posiciones GPS de conductores en recorridos
// SOLO usa el adapter db — CERO dependencia directa a Supabase
// ============================================================

const db = require('../config/database');

/**
 * Construye un objeto GeoJSON Point compatible con PostGIS
 * a partir de coordenadas lon/lat.
 * Equivale a: ST_SetSRID(ST_MakePoint(lon, lat), 4326)
 *
 * @param {number} lon - Longitud
 * @param {number} lat - Latitud
 * @returns {object} GeoJSON Point
 */
function buildGeoJsonPoint(lon, lat) {
  return {
    type: 'Point',
    coordinates: [lon, lat],
    crs: { type: 'name', properties: { name: 'EPSG:4326' } }
  };
}

const PosicionRepository = {
  /**
   * Insertar una posición GPS individual
   * @param {object} datos - { lat, lon, perfil_id, recorrido_id }
   * @returns {Promise<object>} Registro insertado
   */
  async create({ lat, lon, perfil_id, recorrido_id, id_posiciones = null }) {
    const record = {
      lat,
      lon,
      perfil_id,
      recorrido_id,
      geom: buildGeoJsonPoint(lon, lat),
      capturado_ts: new Date().toISOString()
    };
    if (id_posiciones) {
      record.id_posiciones = id_posiciones;
    }
    return db.insert('posiciones', record);
  },

  /**
   * Obtener todas las posiciones de un recorrido, ordenadas cronológicamente y filtradas por sesión
   * @param {string} recorrido_id - UUID del recorrido
   * @param {string|null} desde - ISO timestamp de inicio de sesión
   * @returns {Promise<Array>}
   */
  async findByRecorrido(recorrido_id, desde = null) {
    if (desde) {
      return db.query(
        `SELECT * FROM posiciones 
         WHERE recorrido_id = $1 AND capturado_ts >= $2 
         ORDER BY capturado_ts ASC`,
        [recorrido_id, desde]
      );
    }
    return db.findAll('posiciones', {
      filters: { recorrido_id },
      order: { column: 'capturado_ts', ascending: true }
    });
  },

  /**
   * Obtener la última posición conocida de un conductor
   * @param {string} perfil_id - UUID del conductor
   * @returns {Promise<object|null>}
   */
  async findUltimaPorConductor(perfil_id) {
    return db.findOne('posiciones', {
      filters: { perfil_id },
      order: { column: 'capturado_ts', ascending: false }
    });
  },

  /**
   * Insertar múltiples posiciones (batch / offline fallback)
   * @param {Array<object>} posiciones - Array de { lat, lon, perfil_id, recorrido_id }
   * @returns {Promise<number>} Cantidad de registros insertados
   */
  async createBatch(posiciones) {
    let insertados = 0;

    for (const pos of posiciones) {
      const record = {
        lat: pos.lat,
        lon: pos.lon,
        perfil_id: pos.perfil_id,
        recorrido_id: pos.recorrido_id,
        geom: buildGeoJsonPoint(pos.lon, pos.lat),
        capturado_ts: new Date().toISOString()
      };
      await db.insert('posiciones', record);
      insertados++;
    }

    return insertados;
  },

  /**
   * Actualizar la imagen de una posición específica
   * @param {string} posicion_id - UUID de la posición
   * @param {string} imagen_base64 - Imagen en Base64
   * @returns {Promise<object|null>} Posición actualizada
   */
  async updateImagen(posicion_id, imagen_base64) {
    const rows = await db.query(
      `UPDATE posiciones SET imagen_base64 = $1 WHERE id_posiciones = $2 RETURNING *`,
      [imagen_base64, posicion_id]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0];
  },

  /**
   * Obtiene las posiciones con foto para un recorrido, filtradas desde el inicio de la sesión actual.
   * @param {string} recorrido_id
   * @param {string|null} desde - ISO timestamp de inicio de sesión. Si se pasa, filtra fotos desde ese momento.
   * @returns {Promise<Array>}
   */
  async findFotosByRecorrido(recorrido_id, desde = null) {
    if (desde) {
      const rows = await db.query(
        `SELECT id_posiciones AS id, lat, lon, capturado_ts
         FROM posiciones
         WHERE recorrido_id = $1
           AND imagen_base64 IS NOT NULL
           AND capturado_ts >= $2
         ORDER BY capturado_ts ASC`,
        [recorrido_id, desde]
      );
      return rows;
    }
    // Si no hay fecha de sesión (recorridos muy viejos sin el campo), devuelve todas.
    const rows = await db.query(
      `SELECT id_posiciones AS id, lat, lon, capturado_ts
       FROM posiciones
       WHERE recorrido_id = $1 AND imagen_base64 IS NOT NULL
       ORDER BY capturado_ts ASC`,
      [recorrido_id]
    );
    return rows;
  }
};

module.exports = PosicionRepository;
