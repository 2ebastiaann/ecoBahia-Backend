const express = require('express');
const router = express.Router();
const { registrarInicioRecorrido, registrarFinalizacionRecorrido } = require('../controlador/recorridos.controlador');
const { registrarPosicion } = require('../controlador/ubicaciones.controlador');

router.post('/iniciar', registrarInicioRecorrido);              // POST /api/recorridos/iniciar
router.post('/:id/finalizar', registrarFinalizacionRecorrido);  // POST /api/recorridos/{id}/finalizar
router.post('/:recorrido_id/posiciones', registrarPosicion);    // POST /api/recorridos/:recorrido_id/posiciones

module.exports = router;