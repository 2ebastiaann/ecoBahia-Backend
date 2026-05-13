// routes/ubicaciones.routes.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth.middleware');
const { 
  historialRecorrido, 
  ultimaUbicacionConductor, 
  registrarBatch 
} = require('../controlador/ubicaciones.controlador');

// Acceso para usuarios autenticados
router.get('/recorrido/:recorrido_id', verificarToken, historialRecorrido);
router.get('/conductor/:perfil_id', verificarToken, ultimaUbicacionConductor);
router.post('/batch', verificarToken, registrarBatch);

module.exports = router;
