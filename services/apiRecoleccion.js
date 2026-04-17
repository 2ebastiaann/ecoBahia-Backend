require('dotenv').config();

// =======================
// CONFIG
// =======================
const PERFIL_ID = process.env.PERFIL_ID;

// =======================
// CALLES
// =======================
async function obtenerCalles() {
  const response = await fetch('https://apirecoleccion.gonzaloandreslucio.com/api/calles');
  return response.json();
}

async function obtenerCallePorId(id) {
  const response = await fetch(`https://apirecoleccion.gonzaloandreslucio.com/api/calles/${id}`);
  if (!response.ok) {
    throw new Error(`Error al consultar calle con id ${id}`);
  }
  return response.json();
}

// =======================
// RUTAS (Versión v1 según GitHub)
// =======================
async function obtenerRutas() {
  const res = await fetch(`https://apirecoleccion.gonzaloandreslucio.com/api/rutas?perfil_id=${PERFIL_ID}`);
  if (!res.ok) {
    const text = await res.text();
    console.error('Error obtenerRutas:', res.status, text.substring(0, 100));
    throw new Error(`Error ${res.status}: Falló al obtener rutas desde API`);
  }
  return res.json();
}

async function obtenerRutaPorId(id) {
  const res = await fetch(`https://apirecoleccion.gonzaloandreslucio.com/api/rutas/${id}?perfil_id=${PERFIL_ID}`);
  if (!res.ok) throw new Error(`Error ${res.status}: Ruta no encontrada`);
  return res.json();
}

async function crearRuta(datosRuta) {
  datosRuta.perfil_id = PERFIL_ID;
  const res = await fetch('https://apirecoleccion.gonzaloandreslucio.com/api/rutas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosRuta)
  });
  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.message || 'Error al crear ruta');
  }
  return res.json();
}

// =======================
// VEHÍCULOS (Sin v1 según GitHub)
// =======================
async function obtenerVehiculos() {
  const res = await fetch(`https://apirecoleccion.gonzaloandreslucio.com/api/vehiculos?perfil_id=${PERFIL_ID}`);
  if (!res.ok) {
    const text = await res.text();
    console.error('Error obtenerVehiculos:', res.status, text.substring(0, 100));
    throw new Error(`Error ${res.status}: Falló al obtener vehículos`);
  }
  return res.json();
}

async function obtenerVehiculoPorId(id) {
  const res = await fetch(`https://apirecoleccion.gonzaloandreslucio.com/api/vehiculos/${id}?perfil_id=${PERFIL_ID}`);
  if (!res.ok) throw new Error('Vehículo no encontrado');
  return res.json();
}

async function crearVehiculo(datosVehiculo) {
  datosVehiculo.perfil_id = PERFIL_ID;
  const res = await fetch('https://apirecoleccion.gonzaloandreslucio.com/api/vehiculos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosVehiculo)
  });
  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(errorBody.message || 'Error al crear vehículo');
  }
  return res.json();
}

async function actualizarVehiculo(id, datosVehiculo) {
  datosVehiculo.perfil_id = PERFIL_ID;
  const res = await fetch(`https://apirecoleccion.gonzaloandreslucio.com/api/vehiculos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosVehiculo)
  });
  if (!res.ok) throw new Error('Error al actualizar vehículo');
  return res.json();
}

async function eliminarVehiculo(id) {
  const res = await fetch(`https://apirecoleccion.gonzaloandreslucio.com/api/vehiculos/${id}?perfil_id=${PERFIL_ID}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Error al eliminar vehículo');
  return res.json();
}

// =======================
// RECORRIDOS
// =======================
async function iniciarRecorrido(datosRecorrido) {
  const res = await fetch('https://apirecoleccion.gonzaloandreslucio.com/api/recorridos/iniciar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosRecorrido)
  });
  if (!res.ok) throw new Error('Error al iniciar recorrido');
  return res.json();
}

async function finalizarRecorrido(id, datosFinalizacion) {
  const res = await fetch(`https://apirecoleccion.gonzaloandreslucio.com/api/recorridos/${id}/finalizar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosFinalizacion)
  });
  if (!res.ok) throw new Error('Error al finalizar recorrido');
  return res.json();
}

// =======================
// EXPORTACIÓN ÚNICA
// =======================
module.exports = {
  obtenerCalles,
  obtenerCallePorId,
  obtenerRutas,
  obtenerRutaPorId,
  crearRuta,
  obtenerVehiculos,
  obtenerVehiculoPorId,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
  iniciarRecorrido,
  finalizarRecorrido
};
