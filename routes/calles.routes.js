// routes/calles.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth.middleware');
const { listarCalles, mostrarCallePorId } = require('../controlador/calles.controlador');

// Lectura pública para usuarios autenticados (incluye ciudadano anónimo con JWT)
router.get('/', verificarToken, listarCalles);
router.get('/:id', verificarToken, mostrarCallePorId);

module.exports = router;