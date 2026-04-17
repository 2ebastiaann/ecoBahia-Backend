const { obtenerRutas, obtenerRutaPorId , crearRuta } = require('../services/apiRecoleccion');

async function listarRutas(req, res) {
  try {
    const rutas = await obtenerRutas();
    res.json(rutas);
  } catch (err) {
    console.error("Error listarRutas:", err);
    res.status(500).json({ mensaje: 'Error al consultar rutas', error: err.message });
  }
}

async function mostrarRutaPorId(req, res) {
  try {
    const ruta = await obtenerRutaPorId (req.params.id);
    res.json(ruta);
  } catch (error) {
    res.status(404).json({ mensaje: 'Ruta no encontrada', detalle: error.message });
  }
}


async function registrarRuta(req, res) {
  const { nombre_ruta, perfil_id, shape, calles_ids } = req.body;

  if (!nombre_ruta || !perfil_id) {
    return res.status(400).json({ mensaje: 'nombre_ruta y perfil_id son obligatorios' });
  }

  if (!shape && (!calles_ids || !Array.isArray(calles_ids) || calles_ids.length === 0)) {
    return res.status(400).json({ mensaje: 'Debes enviar shape o al menos un calles_ids' });
  }

  try {
    const nuevaRuta = await crearRuta(req.body);
    res.status(201).json(nuevaRuta);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear ruta', detalle: error.message });
  }
}


module.exports = { listarRutas, mostrarRutaPorId, registrarRuta };