// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controlador/usuarios.controlador');
//POST /api/usuarios/register - Registrar un nuevo usuario
router.post('/register', usuarioControlador.registrarUsuario);

//POST /api/usuarios/login - Iniciar sesión de usuario
router.post('/login', usuarioControlador.logearUsuario);

//GET /api/usuarios/conductores - Listar todos los conductores
router.get('/conductores', usuarioControlador.listarConductores);

//PUT /api/usuarios/conductores/:id - Actualizar conductor
router.put('/conductores/:id', usuarioControlador.actualizarConductor);

//DELETE /api/usuarios/conductores/:id - Eliminar conductor
router.delete('/conductores/:id', usuarioControlador.eliminarConductor);

module.exports = router;