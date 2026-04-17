const express = require('express');
const router = express.Router();
const { registrarInicioRecorrido, registrarFinalizacionRecorrido } = require('../controlador/recorridos.controlador');

router.post('/iniciar', registrarInicioRecorrido);              // POST /api/recorridos/iniciar
router.post('/:id/finalizar', registrarFinalizacionRecorrido);  // POST /api/recorridos/{id}/finalizar

module.exports = router;