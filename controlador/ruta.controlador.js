const { obtenerRutas, obtenerRutaPorId , crearRuta } = require('../services/apiRecoleccion');
const supabase = require('../config/supabase');
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
    
    // GUARDADO DUAL: Supabase Local
    // Podría estar dentro de data.id, id, o id_ruta.
    const idGenerado = nuevaRuta.data?.id || nuevaRuta.id || nuevaRuta.ruta_id || nuevaRuta.id_ruta || Object.values(nuevaRuta).find(val => typeof val === 'string' && val.length > 30);
    
    if (!idGenerado) {
       console.error('No se pudo encontrar el ID de la ruta en la respuesta de la API:', nuevaRuta);
    }

    if (idGenerado && shape) {
      // Guardar con geometría directa
      const { error: supError } = await supabase.from('rutas').insert({
        id_rutas: idGenerado,
        nombre: nombre_ruta,
        color_hex: req.body.color_hex || '#3388ff',
        perfil_id: perfil_id,
        activo: true,
        // PostGIS en Supabase acepta GeoJSON directo si se manda como texto o json
        shape: shape 
      });
      if (supError) console.error('Error guardando ruta en Supabase:', supError);
    } else if (idGenerado && calles_ids) {
      const { error: supError } = await supabase.from('rutas').insert({
        id_rutas: idGenerado,
        nombre: nombre_ruta,
        color_hex: req.body.color_hex || '#3388ff',
        perfil_id: perfil_id,
        activo: true
      });
      if (supError) console.error('Error guardando ruta (vía calles_ids) en Supabase:', supError);
    }

    res.status(201).json(nuevaRuta);
  } catch (error) {
    console.error('Error general registrar ruta:', error);
    res.status(500).json({ mensaje: 'Error al crear ruta', detalle: error.message });
  }
}

module.exports = { listarRutas, mostrarRutaPorId, registrarRuta };