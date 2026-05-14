// routes/reportes.routes.js
const express = require('express');
const router = express.Router();
const { crearReporte, listarReportes } = require('../controlador/reportes.controlador');
const { verificarToken } = require('../middleware/auth.middleware');

// POST: Abierto a todos (público) o requiere token si la app lo exige? 
// Suponiendo que ciudadanos no registrados también pueden reportar, lo dejamos público.
// Si solo es para usuarios de la app, descomenta "verificarToken"
router.post('/', crearReporte); 

// GET: Listar reportes (Esto sí debería estar protegido para los administradores)
router.get('/', verificarToken, listarReportes);

module.exports = router;
