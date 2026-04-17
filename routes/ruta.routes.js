const express = require('express');
const router = express.Router();
const { listarRutas, mostrarRutaPorId, registrarRuta } = require('../controlador/ruta.controlador');

router.get('/', listarRutas);           // GET /Listar todas las rutas
router.get('/:id', mostrarRutaPorId);   // GET /Mostrar Detalles de una ruta por ID
router.post('/', registrarRuta);        // POST /Registrar nueva ruta

module.exports = router;