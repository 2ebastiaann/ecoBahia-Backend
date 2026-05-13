const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth.middleware');
const { registrarInicioRecorrido, registrarFinalizacionRecorrido } = require('../controlador/recorridos.controlador');
const { registrarPosicion } = require('../controlador/ubicaciones.controlador');

// Acceso para conductores autenticados (rol 2) — no requiere admin
router.post('/iniciar', verificarToken, registrarInicioRecorrido);
router.post('/:id/finalizar', verificarToken, registrarFinalizacionRecorrido);
router.post('/:recorrido_id/posiciones', verificarToken, registrarPosicion);

module.exports = router;