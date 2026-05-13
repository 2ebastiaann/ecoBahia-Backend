const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');
const {
    listarVehiculos,
    mostrarVehiculoPorId,
    registrarVehiculo,
    editarVehiculo,
    borrarVehiculo
} = require('../controlador/vehiculos.controlador');

// Lectura: cualquier usuario autenticado
router.get('/', verificarToken, listarVehiculos);
router.get('/:id', verificarToken, mostrarVehiculoPorId);
// Escritura: solo administradores
router.post('/', verificarToken, verificarAdmin, registrarVehiculo);
router.put('/:id', verificarToken, verificarAdmin, editarVehiculo);
router.delete('/:id', verificarToken, verificarAdmin, borrarVehiculo);

module.exports = router;
