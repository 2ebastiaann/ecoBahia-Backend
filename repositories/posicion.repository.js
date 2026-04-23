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
  async create({ lat, lon, perfil_id, recorrido_id }) {
    const record = {
      lat,
      lon,
      perfil_id,
      recorrido_id,
      geom: buildGeoJsonPoint(lon, lat),
      capturado_ts: new Date().toISOString()
    };
    return db.insert('posiciones', record);
  },

  /**
   * Obtener todas las posiciones de un recorrido, ordenadas cronológicamente
   * @param {string} recorrido_id - UUID del recorrido
   * @returns {Promise<Array>}
   */
  async findByRecorrido(recorrido_id) {
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
  }
};

module.exports = PosicionRepository;
