// services/apiRecoleccion/recorridos.service.js
// ============================================================
// Servicio para consumir endpoints de RECORRIDOS (API del profesor)
// ============================================================

const { apiPost } = require('../httpClient');

const API_BASE_URL = process.env.API_BASE_URL || 'https://apirecoleccion.gonzaloandreslucio.com/api';

async function iniciarRecorrido(datosRecorrido) {
  return apiPost(`${API_BASE_URL}/recorridos/iniciar`, datosRecorrido);
}

async function finalizarRecorrido(id, datosFinalizacion) {
  return apiPost(`${API_BASE_URL}/recorridos/${id}/finalizar`, datosFinalizacion);
}

async function registrarPosicionExterna(recorrido_id, datosPosicion) {
  return apiPost(`${API_BASE_URL}/recorridos/${recorrido_id}/posiciones`, datosPosicion);
}

module.exports = { iniciarRecorrido, finalizarRecorrido, registrarPosicionExterna };
