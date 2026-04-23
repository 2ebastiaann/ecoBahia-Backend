const { Router } = require('express');
const { listarRecorridos, crearRecorrido, desactivarRecorrido, activarRecorrido, listarRecorridosPorConductor } = require('../controlador/recorridos_locales.controlador');

const router = Router();

router.get('/', listarRecorridos);
router.get('/conductor/:conductorId', listarRecorridosPorConductor);
router.post('/', crearRecorrido);
router.post('/:id/desactivar', desactivarRecorrido);
router.post('/:id/activar', activarRecorrido);

module.exports = router;
