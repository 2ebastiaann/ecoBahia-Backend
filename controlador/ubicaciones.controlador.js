const PosicionRepository = require('../repositories/posicion.repository');
const sharp = require('sharp');

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
    const nuevaPosicion = await PosicionRepository.create({ lat, lon, perfil_id, recorrido_id });
    
    res.status(201).json({
      success: true,
      message: "Posición registrada correctamente",
      data: nuevaPosicion
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

/**
 * 5. POST /api/recorridos/posiciones/:posicion_id/imagen
 * Recibe una imagen Base64, la procesa a WebP (max 512px) y la asocia a una posición específica.
 */
async function subirImagenPosicion(req, res) {
  const { posicion_id } = req.params;
  const { imagen_base64 } = req.body;

  if (!imagen_base64) {
    return res.status(400).json({ success: false, message: 'La imagen (imagen_base64) es requerida' });
  }

  try {
    // 1. Extraer el contenido real de la imagen base64 (quitando el prefijo si existe)
    let base64Data = imagen_base64;
    if (imagen_base64.includes(',')) {
      base64Data = imagen_base64.split(',')[1];
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');

    // 2. Procesar con Sharp (Redimensionar a 512px preservando proporción y pasar a WEBP calidad 85)
    const webpBuffer = await sharp(imageBuffer)
      .resize({
        width: 512,
        height: 512,
        fit: 'inside', // Mantiene la proporción, el lado mayor no superará 512px
        withoutEnlargement: true // No la agranda si es menor a 512px
      })
      .webp({ quality: 85 })
      .toBuffer();

    // 3. Volver a codificar a Base64 pero ya en formato WEBP
    const finalWebpBase64 = `data:image/webp;base64,${webpBuffer.toString('base64')}`;

    // 4. Intentar asociar la imagen procesada a la posición
    const posicionActualizada = await PosicionRepository.updateImagen(posicion_id, finalWebpBase64);

    if (!posicionActualizada) {
      return res.status(404).json({ success: false, message: 'La posición no existe' });
    }

    // 5. Emitir evento por WebSocket para que el panel web de Admin se entere
    const io = req.app.get('socketio');
    if (io) {
      io.emit('location:photo', {
        posicion_id: posicionActualizada.id_posiciones || posicionActualizada.id,
        recorrido_id: posicionActualizada.recorrido_id,
        lat: posicionActualizada.lat,
        lon: posicionActualizada.lon,
        capturado_ts: posicionActualizada.capturado_ts
      });
    }

    res.status(200).json({
      success: true,
      message: 'Imagen asociada a la posición correctamente'
    });
  } catch (error) {
    console.error('❌ ERROR subirImagenPosicion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asociar la imagen',
      detalle: error.message
    });
  }
}

/**
 * 6. GET /api/recorridos/posiciones/:posicion_id/imagen
 * Obtiene la imagen asociada a una posición y la devuelve como binario WEBP.
 */
async function obtenerImagenPosicion(req, res) {
  const { posicion_id } = req.params;

  try {
    const db = require('../config/database');
    const result = await db.query(
      `SELECT imagen_base64 FROM posiciones WHERE id_posiciones = $1`,
      [posicion_id]
    );

    if (result.rows.length === 0 || !result.rows[0].imagen_base64) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    const imagenBase64 = result.rows[0].imagen_base64;
    
    // Extraer los datos reales del base64 (quitando data:image/webp;base64,)
    let base64Data = imagenBase64;
    if (imagenBase64.includes(',')) {
      base64Data = imagenBase64.split(',')[1];
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Configurar los headers para devolver la imagen binaria
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Content-Length', imageBuffer.length);
    res.status(200).send(imageBuffer);

  } catch (error) {
    console.error('❌ ERROR obtenerImagenPosicion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la imagen',
      detalle: error.message
    });
  }
}

/**
 * 7. GET /api/recorridos/:recorrido_id/fotos
 * Obtiene la lista de posiciones que contienen fotos para un recorrido específico.
 */
async function obtenerFotosRecorrido(req, res) {
  const { recorrido_id } = req.params;

  try {
    const fotos = await PosicionRepository.findFotosByRecorrido(recorrido_id);
    res.status(200).json({ success: true, data: fotos });
  } catch (error) {
    console.error('❌ ERROR obtenerFotosRecorrido:', error);
    res.status(500).json({ success: false, message: 'Error al obtener fotos', detalle: error.message });
  }
}

module.exports = {
  registrarPosicion,
  historialRecorrido,
  ultimaUbicacionConductor,
  registrarBatch,
  subirImagenPosicion,
  obtenerImagenPosicion,
  obtenerFotosRecorrido
};
