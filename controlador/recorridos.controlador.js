const { iniciarRecorrido, finalizarRecorrido } = require('../services/apiRecoleccion');

// POST iniciar recorrido
async function registrarInicioRecorrido(req, res) {
  try {
    const recorrido = await iniciarRecorrido(req.body);
    res.status(201).json(recorrido);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al iniciar recorrido', detalle: error.message });
  }
}

// POST finalizar recorrido
async function registrarFinalizacionRecorrido(req, res) {
  try {
    const recorridoFinalizado = await finalizarRecorrido(req.params.id, req.body);
    res.json(recorridoFinalizado);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al finalizar recorrido', detalle: error.message });
  }
}

module.exports = { registrarInicioRecorrido, registrarFinalizacionRecorrido };