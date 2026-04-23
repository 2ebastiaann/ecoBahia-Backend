// services/apiRecoleccion/vehiculos.service.js
// ============================================================
// Servicio para consumir endpoints de VEHÍCULOS (API del profesor)
// ============================================================

const { apiGet, apiPost, apiPut, apiDelete } = require('../httpClient');

const API_BASE_URL = process.env.API_BASE_URL || 'https://apirecoleccion.gonzaloandreslucio.com/api';
const PERFIL_ID = process.env.PERFIL_ID;

async function obtenerVehiculos() {
  return apiGet(`${API_BASE_URL}/vehiculos?perfil_id=${PERFIL_ID}`);
}

async function obtenerVehiculoPorId(id) {
  return apiGet(`${API_BASE_URL}/vehiculos/${id}?perfil_id=${PERFIL_ID}`);
}

async function crearVehiculo(datosVehiculo) {
  datosVehiculo.perfil_id = PERFIL_ID;
  return apiPost(`${API_BASE_URL}/vehiculos`, datosVehiculo);
}

async function actualizarVehiculo(id, datosVehiculo) {
  datosVehiculo.perfil_id = PERFIL_ID;
  return apiPut(`${API_BASE_URL}/vehiculos/${id}`, datosVehiculo);
}

async function eliminarVehiculo(id) {
  return apiDelete(`${API_BASE_URL}/vehiculos/${id}?perfil_id=${PERFIL_ID}`);
}

module.exports = {
  obtenerVehiculos,
  obtenerVehiculoPorId,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo
};
