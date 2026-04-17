// routes/calles.js
const express = require('express');
const router = express.Router();
const { listarCalles, mostrarCallePorId } = require('../controlador/calles.controlador');

// GET /calles → lista todas las calles
router.get('/', listarCalles);

// GET /calles/:id → muestra detalles de una calle específica
router.get('/:id', mostrarCallePorId);



module.exports = router;