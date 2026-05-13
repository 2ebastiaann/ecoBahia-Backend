const { Router } = require('express');
const { verificarToken } = require('../middleware/auth.middleware');
const { listarRecorridos, crearRecorrido, desactivarRecorrido, activarRecorrido, listarRecorridosPorConductor } = require('../controlador/recorridos_locales.controlador');

const router = Router();

// Acceso para usuarios autenticados (admin y conductor)
router.get('/', verificarToken, listarRecorridos);
router.get('/conductor/:conductorId', verificarToken, listarRecorridosPorConductor);
router.post('/', verificarToken, crearRecorrido);
router.post('/:id/desactivar', verificarToken, desactivarRecorrido);
router.post('/:id/activar', verificarToken, activarRecorrido);

module.exports = router;
