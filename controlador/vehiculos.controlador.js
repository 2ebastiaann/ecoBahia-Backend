// controlador/vehiculos.controlador.js

const {
  obtenerVehiculos,
  obtenerVehiculoPorId,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo
} = require('../services/apiRecoleccion/vehiculos.service');
const VehiculoRepository = require('../repositories/vehiculo.repository');

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

    // 2. Extraer el ID generado
    const idGenerado = nuevoVehiculo.id || nuevoVehiculo.vehiculo_id || req.body.placa;

    // 3. Guardar Espejo en BD local
    if (idGenerado) {
      try {
        await VehiculoRepository.create({
          id_vehiculo: idGenerado,
          placa: req.body.placas || req.body.placa,
          marca: req.body.marca,
          modelo: req.body.modelo
        });
      } catch (dbError) {
        console.error('Error guardando espejo de vehículo en BD local:', dbError);
      }
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

    // 2. Actualizar Espejo en BD local
    try {
      await VehiculoRepository.update(req.params.id, {
        placa: req.body.placas || req.body.placa,
        marca: req.body.marca,
        modelo: req.body.modelo
      });
    } catch (dbError) {
      console.error('Error actualizando espejo de vehículo en BD local:', dbError);
    }

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

    // 2. Eliminar Espejo en BD local
    try {
      await VehiculoRepository.remove(req.params.id);
    } catch (dbError) {
      console.error('Error eliminando espejo de vehículo en BD local:', dbError);
    }

    res.json({ mensaje: 'Vehículo eliminado', resultado });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al eliminar vehículo', detalle: error.message });
  }
}

module.exports = { listarVehiculos, mostrarVehiculoPorId, registrarVehiculo, editarVehiculo, borrarVehiculo };