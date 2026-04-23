// controlador/asignaciones.controlador.js

const AsignacionRepository = require('../repositories/asignacion.repository');

// ==========================================
// CONDUCTOR <-> VEHICULO
// ==========================================

async function listarAsignacionesConductores(req, res) {
  try {
    const data = await AsignacionRepository.findAllConductorVehiculo();
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error listar asignaciones', detalle: error.message });
  }
}

async function asignarConductorVehiculo(req, res) {
  const { usuario_id, vehiculo_id } = req.body;
  if (!usuario_id || !vehiculo_id) return res.status(400).json({ mensaje: 'Debes seleccionar un conductor y un vehículo' });

  try {
    // Verificar si el conductor ya tiene un vehículo asignado
    const conductorExistente = await AsignacionRepository.findConductorAsignado(usuario_id);
    if (conductorExistente) {
      return res.status(409).json({ mensaje: 'Este conductor ya tiene un vehículo asignado. Remueve la asignación actual antes de crear una nueva.' });
    }

    // Verificar si el vehículo ya tiene un conductor asignado
    const vehiculoExistente = await AsignacionRepository.findVehiculoConConductor(vehiculo_id);
    if (vehiculoExistente) {
      return res.status(409).json({ mensaje: 'Este vehículo ya tiene un conductor asignado. Remueve la asignación actual antes de reasignarlo.' });
    }

    // Crear la asignación
    const data = await AsignacionRepository.createConductorVehiculo(usuario_id, vehiculo_id);
    res.status(201).json({ mensaje: 'Conductor enlazado a vehículo con éxito', data });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al asignar conductor a vehículo', detalle: error.message });
  }
}

async function desasignarConductorVehiculo(req, res) {
  const { id } = req.params;
  try {
    await AsignacionRepository.removeConductorVehiculo(id);
    res.json({ mensaje: 'Asignación removida correctamente' });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al desasignar', detalle: error.message });
  }
}


// ==========================================
// VEHICULO <-> RUTA
// ==========================================

async function listarAsignacionesRutas(req, res) {
  try {
    const data = await AsignacionRepository.findAllVehiculoRuta();
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error listar asignaciones', detalle: error.message });
  }
}

async function asignarVehiculoRuta(req, res) {
  const { vehiculo_id, ruta_id } = req.body;
  if (!vehiculo_id || !ruta_id) return res.status(400).json({ mensaje: 'Debes seleccionar un vehículo y una ruta' });

  try {
    // Verificar si el vehículo ya tiene una ruta asignada
    const vehiculoExistente = await AsignacionRepository.findVehiculoConRuta(vehiculo_id);
    if (vehiculoExistente) {
      return res.status(409).json({ mensaje: 'Este vehículo ya tiene una ruta asignada. Remueve la asignación actual antes de crear una nueva.' });
    }

    // Verificar si la ruta ya tiene un vehículo asignado
    const rutaExistente = await AsignacionRepository.findRutaConVehiculo(ruta_id);
    if (rutaExistente) {
      return res.status(409).json({ mensaje: 'Esta ruta ya tiene un vehículo asignado. Remueve la asignación actual antes de reasignarla.' });
    }

    // Crear la asignación
    const data = await AsignacionRepository.createVehiculoRuta(vehiculo_id, ruta_id);
    res.status(201).json({ mensaje: 'Vehículo enlazado a ruta con éxito', data });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al asignar vehículo a ruta', detalle: error.message });
  }
}

async function desasignarVehiculoRuta(req, res) {
  const { id } = req.params;
  try {
    await AsignacionRepository.removeVehiculoRuta(id);
    res.json({ mensaje: 'Asignación removida correctamente' });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al desasignar', detalle: error.message });
  }
}

module.exports = {
  listarAsignacionesConductores,
  asignarConductorVehiculo,
  desasignarConductorVehiculo,
  listarAsignacionesRutas,
  asignarVehiculoRuta,
  desasignarVehiculoRuta
};
