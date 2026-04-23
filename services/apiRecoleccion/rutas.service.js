// services/apiRecoleccion/rutas.service.js
// ============================================================
// Servicio para consumir endpoints de RUTAS (API del profesor)
// ============================================================

const { apiGet, apiPost } = require('../httpClient');

const API_BASE_URL = process.env.API_BASE_URL || 'https://apirecoleccion.gonzaloandreslucio.com/api';
const PERFIL_ID = process.env.PERFIL_ID;

async function obtenerRutas() {
  return apiGet(`${API_BASE_URL}/rutas?perfil_id=${PERFIL_ID}`);
}

async function obtenerRutaPorId(id) {
  return apiGet(`${API_BASE_URL}/rutas/${id}?perfil_id=${PERFIL_ID}`);
}

async function crearRuta(datosRuta) {
  datosRuta.perfil_id = PERFIL_ID;
  return apiPost(`${API_BASE_URL}/rutas`, datosRuta);
}

module.exports = { obtenerRutas, obtenerRutaPorId, crearRuta };
