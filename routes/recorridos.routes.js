const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth.middleware');
const { 
  listarRecorridos, 
  listarRecorridosPorConductor, 
  registrarInicioRecorrido, 
  registrarFinalizacionRecorrido, 
  activarRecorrido 
} = require('../controlador/recorridos.controlador');
const { registrarPosicion } = require('../controlador/ubicaciones.controlador');

// Consultas
router.get('/', verificarToken, listarRecorridos);
router.get('/conductor/:conductorId', verificarToken, listarRecorridosPorConductor);

// Acciones sobre recorridos
router.post('/iniciar', verificarToken, registrarInicioRecorrido);
router.post('/:id/finalizar', verificarToken, registrarFinalizacionRecorrido);
router.post('/:id/activar', verificarToken, activarRecorrido);

// Posiciones asociadas al recorrido
router.post('/:recorrido_id/posiciones', verificarToken, registrarPosicion);

module.exports = router;