// controlador/ruta.controlador.js

const { obtenerRutas, obtenerRutaPorId, crearRuta } = require('../services/apiRecoleccion/rutas.service');
const RutaRepository = require('../repositories/ruta.repository');

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
    const ruta = await obtenerRutaPorId(req.params.id);
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
    // ── Verificar nombre duplicado contra la API externa (fuente de verdad) ──
    const rutasExistentes = await obtenerRutas();
    const lista = Array.isArray(rutasExistentes?.data)
      ? rutasExistentes.data
      : Array.isArray(rutasExistentes)
        ? rutasExistentes
        : [];

    const nombreNormalizado = nombre_ruta.trim().toLowerCase();
    const yaExiste = lista.some(r => {
      const n = (r.nombre_ruta || r.nombre || '').trim().toLowerCase();
      return n === nombreNormalizado;
    });

    if (yaExiste) {
      return res.status(409).json({
        mensaje: `Ya existe una ruta con el nombre "${nombre_ruta}". Por favor usa un nombre diferente.`
      });
    }

    // ── Crear en API externa ──
    const nuevaRuta = await crearRuta(req.body);

    // ── Espejo en BD local ──
    const idGenerado = nuevaRuta.data?.id || nuevaRuta.id || nuevaRuta.ruta_id || nuevaRuta.id_ruta
      || Object.values(nuevaRuta).find(val => typeof val === 'string' && val.length > 30);

    if (idGenerado) {
      try {
        await RutaRepository.create({
          id_rutas: idGenerado,
          nombre: nombre_ruta,
          color_hex: req.body.color_hex || '#3388ff',
          perfil_id,
          activo: true,
          shape: shape || null
        });
      } catch (dbError) {
        console.error('Error guardando espejo de ruta en BD local:', dbError);
      }
    }

    res.status(201).json(nuevaRuta);
  } catch (error) {
    console.error('Error general registrar ruta:', error);
    res.status(500).json({ mensaje: 'Error al crear ruta', detalle: error.message });
  }
}


module.exports = { listarRutas, mostrarRutaPorId, registrarRuta };