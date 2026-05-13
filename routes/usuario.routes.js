// routes/usuario.routes.js
const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controlador/usuarios.controlador');
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');

// POST /api/usuarios/login — Público: inicio de sesión administrador
router.post('/login', usuarioControlador.logearUsuario);

// POST /api/usuarios/login-conductor — Público: inicio de sesión conductor (móvil)
router.post('/login-conductor', usuarioControlador.logearConductor);

// POST /api/usuarios/register — Protegido: solo admin puede registrar nuevos usuarios
router.post('/register', verificarToken, verificarAdmin, usuarioControlador.registrarUsuario);

// GET /api/usuarios/me — Protegido: perfil del usuario autenticado
router.get('/me', verificarToken, usuarioControlador.obtenerPerfil);

// GET /api/usuarios/conductores — Protegido: solo admin lista conductores
router.get('/conductores', verificarToken, verificarAdmin, usuarioControlador.listarConductores);

// PUT /api/usuarios/conductores/:id — Protegido: solo admin actualiza conductores
router.put('/conductores/:id', verificarToken, verificarAdmin, usuarioControlador.actualizarConductor);

// DELETE /api/usuarios/conductores/:id — Protegido: solo admin elimina conductores
router.delete('/conductores/:id', verificarToken, verificarAdmin, usuarioControlador.eliminarConductor);

module.exports = router;