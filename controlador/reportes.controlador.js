// controlador/reportes.controlador.js
const ReporteRepository = require('../repositories/reporte.repository');

async function crearReporte(req, res) {
  const { nombre, email, usuario_id, reporte, imagen_base64 } = req.body;

  // Validaciones básicas
  if (!nombre || !email || !reporte) {
    return res.status(400).json({ mensaje: 'Los campos nombre, email y reporte son obligatorios.' });
  }

  // Validación tamaño de imagen base64 (5 MB aprox)
  // 5MB en base64 son aproximadamente 6.8MB de cadena de texto (5 * 1024 * 1024 * 1.37)
  if (imagen_base64 && imagen_base64.length > 7000000) {
    return res.status(400).json({ mensaje: 'La imagen supera el límite máximo permitido de 5 MB.' });
  }

  try {
    const nuevoReporte = await ReporteRepository.create({
      nombre,
      email,
      usuario_id,
      reporte,
      imagen_base64
    });

    // Emitir el evento por WebSocket si io está disponible
    const io = req.app.get('socketio');
    if (io) {
      io.emit('nuevo_reporte', nuevoReporte);
    }

    res.status(201).json({
      mensaje: 'Reporte creado exitosamente',
      data: nuevoReporte
    });
  } catch (error) {
    console.error('❌ ERROR POST reporte:', error);
    res.status(500).json({ mensaje: 'Error al crear el reporte', detalle: error.message });
  }
}

async function listarReportes(req, res) {
  try {
    const reportes = await ReporteRepository.findAll();
    res.json(reportes);
  } catch (error) {
    console.error('❌ ERROR GET reportes:', error);
    res.status(500).json({ mensaje: 'Error al listar los reportes', detalle: error.message });
  }
}

module.exports = {
  crearReporte,
  listarReportes
};
