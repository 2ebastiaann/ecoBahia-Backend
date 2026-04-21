// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controlador/usuarios.controlador');
const { verificarToken } = require('../middleware/auth.middleware');

//POST /api/usuarios/register - Registrar un nuevo usuario
router.post('/register', usuarioControlador.registrarUsuario);

//POST /api/usuarios/login - Iniciar sesión de usuario (web - cualquier rol)
router.post('/login', usuarioControlador.logearUsuario);

//POST /api/usuarios/login-conductor - Login exclusivo para conductores (móvil)
router.post('/login-conductor', usuarioControlador.logearConductor);

//GET /api/usuarios/me - Obtener perfil del usuario autenticado (requiere JWT)
router.get('/me', verificarToken, usuarioControlador.obtenerPerfil);

//GET /api/usuarios/conductores - Listar todos los conductores
router.get('/conductores', usuarioControlador.listarConductores);

//PUT /api/usuarios/conductores/:id - Actualizar conductor
router.put('/conductores/:id', usuarioControlador.actualizarConductor);

//DELETE /api/usuarios/conductores/:id - Eliminar conductor
router.delete('/conductores/:id', usuarioControlador.eliminarConductor);

module.exports = router;