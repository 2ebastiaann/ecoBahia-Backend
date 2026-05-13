const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');
const { listarRutas, mostrarRutaPorId, registrarRuta } = require('../controlador/ruta.controlador');

// Lectura: cualquier usuario autenticado
router.get('/', verificarToken, listarRutas);
router.get('/:id', verificarToken, mostrarRutaPorId);
// Escritura: solo administradores
router.post('/', verificarToken, verificarAdmin, registrarRuta);

module.exports = router;