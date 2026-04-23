// controlador/ubicaciones.controlador.js
const PosicionRepository = require('../repositories/posicion.repository');

/**
 * 1. POST /api/recorridos/:recorrido_id/posiciones
 * Guardar una ubicación GPS del conductor en la base de datos.
 */
async function registrarPosicion(req, res) {
  const { recorrido_id } = req.params;
  const { lat, lon, perfil_id } = req.body;

  if (lat === undefined || lon === undefined || !perfil_id || !recorrido_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Faltan datos obligatorios (lat, lon, perfil_id, recorrido_id en params)' 
    });
  }

  try {
    await PosicionRepository.create({ lat, lon, perfil_id, recorrido_id });
    
    res.status(201).json({
      success: true,
      message: "Posición registrada correctamente"
    });
  } catch (error) {
    console.error('❌ ERROR registrarPosicion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar la posición', 
      detalle: error.message 
    });
  }
}

/**
 * 2. GET /api/ubicaciones/recorrido/:recorrido_id
 * Devolver todas las posiciones de un recorrido.
 */
async function historialRecorrido(req, res) {
  const { recorrido_id } = req.params;

  try {
    const posiciones = await PosicionRepository.findByRecorrido(recorrido_id);
    res.json({ success: true, data: posiciones });
  } catch (error) {
    console.error('❌ ERROR historialRecorrido:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener el historial del recorrido', 
      detalle: error.message 
    });
  }
}

/**
 * 3. GET /api/ubicaciones/conductor/:perfil_id
 * Obtener la última ubicación conocida del conductor.
 */
async function ultimaUbicacionConductor(req, res) {
  const { perfil_id } = req.params;

  try {
    const ultimaPosicion = await PosicionRepository.findUltimaPorConductor(perfil_id);
    if (!ultimaPosicion) {
      return res.status(404).json({ success: false, message: 'No hay posiciones para este conductor' });
    }
    res.json({ success: true, data: ultimaPosicion });
  } catch (error) {
    console.error('❌ ERROR ultimaUbicacionConductor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener la última ubicación', 
      detalle: error.message 
    });
  }
}

/**
 * 4. POST /api/ubicaciones/batch
 * Recibir múltiples ubicaciones cuando el móvil está offline.
 */
async function registrarBatch(req, res) {
  const posiciones = req.body;

  if (!Array.isArray(posiciones) || posiciones.length === 0) {
    return res.status(400).json({ success: false, message: 'Se espera un array de posiciones' });
  }

  // Validar formato de los elementos
  for (const pos of posiciones) {
    if (pos.lat === undefined || pos.lon === undefined || !pos.perfil_id || !pos.recorrido_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cada posición debe contener lat, lon, perfil_id y recorrido_id' 
      });
    }
  }

  try {
    const insertados = await PosicionRepository.createBatch(posiciones);
    res.status(201).json({ 
      success: true, 
      message: `Se insertaron ${insertados} posiciones correctamente`,
      count: insertados
    });
  } catch (error) {
    console.error('❌ ERROR registrarBatch:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al procesar el batch de posiciones', 
      detalle: error.message 
    });
  }
}

module.exports = {
  registrarPosicion,
  historialRecorrido,
  ultimaUbicacionConductor,
  registrarBatch
};
