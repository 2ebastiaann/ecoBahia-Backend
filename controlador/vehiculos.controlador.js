const {
  obtenerVehiculos,
  obtenerVehiculoPorId,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo
} = require('../services/apiRecoleccion');
const supabase = require('../config/supabase'); // Importar Supabase

// GET todos
async function listarVehiculos(req, res) {
  try {
    const vehiculos = await obtenerVehiculos();
    res.json(vehiculos);
  } catch (err) {
    console.error("Error listarVehiculos:", err);
    res.status(500).json({ mensaje: 'Error al consultar vehículos', error: err.message });
  }
}

// GET por id
async function mostrarVehiculoPorId(req, res) {
  try {
    const vehiculo = await obtenerVehiculoPorId(req.params.id);
    res.json(vehiculo);
  } catch {
    res.status(404).json({ mensaje: 'Vehículo no encontrado' });
  }
}

// POST crear
async function registrarVehiculo(req, res) {
  try {
    // 1. Guardar en API del Profesor
    const nuevoVehiculo = await crearVehiculo(req.body);

    // 2. Extraer el ID que nos dio el profesor (asumimos que viene en 'id' o 'vehiculo_id' dependiendo de la API)
    // Normalmente devuelven el objeto creado. Si devuelve { id: 123, placa: '...' }
    const idGenerado = nuevoVehiculo.id || nuevoVehiculo.vehiculo_id || req.body.placa; // Fallback a la placa si no hay ID obvio

    // 3. Guardar Espejo en Supabase
    if (idGenerado) {
      await supabase.from('vehiculos').insert({
        id_vehiculo: idGenerado.toString(),
        placa: req.body.placas || req.body.placa, // Dependiendo de cómo le llame tu profesor
        marca: req.body.marca || 'Generico',
        modelo: req.body.modelo || 'Desconocido',
        activo: true
      });
    }

    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear vehículo', detalle: error.message });
  }
}

// PUT actualizar
async function editarVehiculo(req, res) {
  try {
    // 1. Actualizar en API Prof
    const vehiculoActualizado = await actualizarVehiculo(req.params.id, req.body);

    // 2. Actualizar Espejo en Supabase
    await supabase.from('vehiculos')
      .update({
        placa: req.body.placas || req.body.placa,
        marca: req.body.marca,
        modelo: req.body.modelo
      })
      .eq('id_vehiculo', req.params.id.toString());

    res.json(vehiculoActualizado);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar vehículo', detalle: error.message });
  }
}

// DELETE eliminar
async function borrarVehiculo(req, res) {
  try {
    // 1. Eliminar de API Prof
    const resultado = await eliminarVehiculo(req.params.id);

    // 2. Eliminar Espejo en Supabase
    await supabase.from('vehiculos')
      .delete()
      .eq('id_vehiculo', req.params.id.toString());

    res.json({ mensaje: 'Vehículo eliminado', resultado });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al eliminar vehículo', detalle: error.message });
  }
}

module.exports = { listarVehiculos, mostrarVehiculoPorId, registrarVehiculo, editarVehiculo, borrarVehiculo };