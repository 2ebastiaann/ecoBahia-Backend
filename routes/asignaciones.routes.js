const express = require('express');
const router = express.Router();
const {
  listarAsignacionesConductores,
  asignarConductorVehiculo,
  desasignarConductorVehiculo,
  listarAsignacionesRutas,
  asignarVehiculoRuta,
  desasignarVehiculoRuta
} = require('../controlador/asignaciones.controlador');

// Conductores - Vehiculos
router.get('/conductores', listarAsignacionesConductores);
router.post('/conductores', asignarConductorVehiculo);
router.delete('/conductores/:id', desasignarConductorVehiculo);

// Vehiculos - Rutas
router.get('/rutas', listarAsignacionesRutas);
router.post('/rutas', asignarVehiculoRuta);
router.delete('/rutas/:id', desasignarVehiculoRuta);

module.exports = router;
