const { Router } = require('express');
const { listarRecorridos, crearRecorrido, desactivarRecorrido } = require('../controlador/recorridos_locales.controlador');

const router = Router();

router.get('/', listarRecorridos);
router.post('/', crearRecorrido);
router.post('/:id/desactivar', desactivarRecorrido);

module.exports = router;
