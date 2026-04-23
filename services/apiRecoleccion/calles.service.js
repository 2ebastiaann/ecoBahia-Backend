// services/apiRecoleccion/calles.service.js
// ============================================================
// Servicio para consumir endpoints de CALLES (API del profesor)
// ============================================================

const { apiGet } = require('../httpClient');

const API_BASE_URL = process.env.API_BASE_URL || 'https://apirecoleccion.gonzaloandreslucio.com/api';

async function obtenerCalles() {
  return apiGet(`${API_BASE_URL}/calles`);
}

async function obtenerCallePorId(id) {
  return apiGet(`${API_BASE_URL}/calles/${id}`);
}

module.exports = { obtenerCalles, obtenerCallePorId };
