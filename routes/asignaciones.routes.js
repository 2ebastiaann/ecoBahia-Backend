const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');
const {
  listarAsignacionesConductores,
  asignarConductorVehiculo,
  desasignarConductorVehiculo,
  listarAsignacionesRutas,
  asignarVehiculoRuta,
  desasignarVehiculoRuta
} = require('../controlador/asignaciones.controlador');

// Conductores - Vehiculos (solo admin)
router.get('/conductores', verificarToken, verificarAdmin, listarAsignacionesConductores);
router.post('/conductores', verificarToken, verificarAdmin, asignarConductorVehiculo);
router.delete('/conductores/:id', verificarToken, verificarAdmin, desasignarConductorVehiculo);

// Vehiculos - Rutas (solo admin)
router.get('/rutas', verificarToken, verificarAdmin, listarAsignacionesRutas);
router.post('/rutas', verificarToken, verificarAdmin, asignarVehiculoRuta);
router.delete('/rutas/:id', verificarToken, verificarAdmin, desasignarVehiculoRuta);

module.exports = router;
