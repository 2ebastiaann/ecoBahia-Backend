const express = require('express');
const router = express.Router();
const {
    listarVehiculos,
    mostrarVehiculoPorId,
    registrarVehiculo,
    editarVehiculo,
    borrarVehiculo
} = require('../controlador/vehiculos.controlador');

router.get('/', listarVehiculos);
router.get('/:id', mostrarVehiculoPorId);
router.post('/', registrarVehiculo);
router.put('/:id', editarVehiculo);
router.delete('/:id', borrarVehiculo);

module.exports = router;
