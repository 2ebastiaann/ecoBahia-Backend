// routes/ubicaciones.routes.js
const express = require('express');
const router = express.Router();
const { 
  historialRecorrido, 
  ultimaUbicacionConductor, 
  registrarBatch 
} = require('../controlador/ubicaciones.controlador');

// GET /api/ubicaciones/recorrido/:recorrido_id
router.get('/recorrido/:recorrido_id', historialRecorrido);

// GET /api/ubicaciones/conductor/:perfil_id
router.get('/conductor/:perfil_id', ultimaUbicacionConductor);

// POST /api/ubicaciones/batch
router.post('/batch', registrarBatch);

module.exports = router;
