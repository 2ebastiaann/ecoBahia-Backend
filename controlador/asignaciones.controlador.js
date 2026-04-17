const supabase = require('../config/supabase');

// ==========================================
// CONDUCTOR <-> VEHICULO
// ==========================================

async function listarAsignacionesConductores(req, res) {
  try {
    const { data, error } = await supabase
      .from('conductor_vehiculo')
      .select('*');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error listar asignaciones', detalle: error.message });
  }
}

async function asignarConductorVehiculo(req, res) {
  const { usuario_id, vehiculo_id } = req.body;
  if (!usuario_id || !vehiculo_id) return res.status(400).json({ mensaje: 'Debes seleccionar un conductor y un vehículo' });

  try {
    // Verificar si el conductor ya tiene un vehículo asignado
    const { data: conductorExistente } = await supabase
      .from('conductor_vehiculo')
      .select('id')
      .eq('usuario_id', usuario_id)
      .maybeSingle();

    if (conductorExistente) {
      return res.status(409).json({ mensaje: 'Este conductor ya tiene un vehículo asignado. Remueve la asignación actual antes de crear una nueva.' });
    }

    // Verificar si el vehículo ya tiene un conductor asignado
    const { data: vehiculoExistente } = await supabase
      .from('conductor_vehiculo')
      .select('id')
      .eq('vehiculo_id', vehiculo_id)
      .maybeSingle();

    if (vehiculoExistente) {
      return res.status(409).json({ mensaje: 'Este vehículo ya tiene un conductor asignado. Remueve la asignación actual antes de reasignarlo.' });
    }

    // Crear la asignación
    const { data, error } = await supabase
      .from('conductor_vehiculo')
      .insert({ usuario_id, vehiculo_id })
      .select();

    if (error) throw error;
    res.status(201).json({ mensaje: 'Conductor enlazado a vehículo con éxito', data });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al asignar conductor a vehículo', detalle: error.message });
  }
}

async function desasignarConductorVehiculo(req, res) {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('conductor_vehiculo').delete().eq('id', id);
    if (error) throw error;
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
    const { data, error } = await supabase
      .from('vehiculo_ruta')
      .select('*');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error listar asignaciones', detalle: error.message });
  }
}

async function asignarVehiculoRuta(req, res) {
  const { vehiculo_id, ruta_id } = req.body;
  if (!vehiculo_id || !ruta_id) return res.status(400).json({ mensaje: 'Debes seleccionar un vehículo y una ruta' });

  try {
    // Verificar si el vehículo ya tiene una ruta asignada
    const { data: vehiculoExistente } = await supabase
      .from('vehiculo_ruta')
      .select('id')
      .eq('vehiculo_id', vehiculo_id)
      .maybeSingle();

    if (vehiculoExistente) {
      return res.status(409).json({ mensaje: 'Este vehículo ya tiene una ruta asignada. Remueve la asignación actual antes de crear una nueva.' });
    }

    // Verificar si la ruta ya tiene un vehículo asignado
    const { data: rutaExistente } = await supabase
      .from('vehiculo_ruta')
      .select('id')
      .eq('ruta_id', ruta_id)
      .maybeSingle();

    if (rutaExistente) {
      return res.status(409).json({ mensaje: 'Esta ruta ya tiene un vehículo asignado. Remueve la asignación actual antes de reasignarla.' });
    }

    // Crear la asignación
    const { data, error } = await supabase
      .from('vehiculo_ruta')
      .insert({ vehiculo_id, ruta_id })
      .select();

    if (error) throw error;
    res.status(201).json({ mensaje: 'Vehículo enlazado a ruta con éxito', data });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al asignar vehículo a ruta', detalle: error.message });
  }
}

async function desasignarVehiculoRuta(req, res) {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('vehiculo_ruta').delete().eq('id', id);
    if (error) throw error;
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
