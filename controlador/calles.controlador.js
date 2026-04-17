// controlador/calles.controlador.js
const { obtenerCalles, obtenerCallePorId } = require('../services/apiRecoleccion');

// Listar todas las calles
async function listarCalles(req, res) {
  try {
    const calles = await obtenerCalles();
    res.json(calles);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consumir api/calles' });
  }
}

// Mostrar detalles de una calle por ID
async function mostrarCallePorId(req, res) {
  const { id } = req.params;
  try {
    const calle = await obtenerCallePorId(id);
    res.json(calle);
  } catch (error) {
    res.status(404).json({ mensaje: `No se encontró la calle con id ${id}` });
  }
}

module.exports = { listarCalles, mostrarCallePorId };