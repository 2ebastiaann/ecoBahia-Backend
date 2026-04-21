// controlador/usuarios.controlador.js

const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ============================================
// Registrar usuario (Supabase)
// ============================================
exports.registrarUsuario = async (req, res) => {
  try {
    const { email, password, id_rol, nombre, apellido } = req.body;

    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar si el usuario ya existe
    const { data: existeUsuario, error: errorExiste } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (errorExiste) throw errorExiste;

    if (existeUsuario) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Crear hash de contraseña
    const hash = await bcrypt.hash(password, 10);

    // Insertar usuario en Supabase
    const { data: nuevoUsuario, error: errorInsert } = await supabase
      .from('usuarios')
      .insert({
        email: email,
        password_hash: hash,
        id_rol: id_rol || 3,
        nombre: nombre,
        apellido: apellido
      })
      .select()
      .single();

    if (errorInsert) throw errorInsert;

    res.status(201).json({
      ok: true,
      usuario: {
        id_usuario: nuevoUsuario.id_usuario,
        email: nuevoUsuario.email,
        id_rol: nuevoUsuario.id_rol,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        fecha_creacion: nuevoUsuario.fecha_creacion
      }
    });

  } catch (error) {
    console.error("❌ Error registrar usuario:", error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};


// ============================================
// Login usuario (Supabase)
// ============================================
exports.logearUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Buscar usuario
    const { data: usuario, error: errorSelect } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (errorSelect) throw errorSelect;
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar contraseña
    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crear token
    const token = jwt.sign(
      { id: usuario.id_usuario, id_rol: usuario.id_rol },
      process.env.JWT_SECRET || '12345fallback',
      { expiresIn: '2h' }
    );

    res.json({
      ok: true,
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        id_rol: usuario.id_rol
      }
    });

  } catch (error) {
    console.error("❌ Error login:", error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// ============================================
// Listar Conductores (Supabase)
// ============================================
exports.listarConductores = async (req, res) => {
  try {
    const { data: conductores, error } = await supabase
      .from('usuarios')
      .select('id_usuario, email, nombre, apellido')
      .eq('id_rol', 2);

    if (error) throw error;
    res.json(conductores);
  } catch (error) {
    console.error("❌ Error listar conductores:", error);
    res.status(500).json({ error: 'Error al listar conductores' });
  }
};

// ============================================
// Actualizar Conductor (Supabase)
// ============================================
exports.actualizarConductor = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nombre, apellido, password } = req.body;

    const updates = { email, nombre, apellido };

    // Si se envía contraseña, actualizarla también
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.password_hash = hash;
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id_usuario', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ ok: true, msg: 'Conductor actualizado', usuario: data });
  } catch (error) {
    console.error("❌ Error actualizar conductor:", error);
    res.status(500).json({ error: 'Error al actualizar conductor' });
  }
};

// ============================================
// Eliminar Conductor (Supabase)
// ============================================
exports.eliminarConductor = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id_usuario', id);

    if (error) throw error;
    res.json({ ok: true, msg: 'Conductor eliminado' });
  } catch (error) {
    console.error("❌ Error eliminar conductor:", error);
    res.status(500).json({ error: 'Error al eliminar conductor' });
  }
};

// ============================================
// Login exclusivo para conductores (id_rol=2)
// ============================================
exports.logearConductor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Buscar usuario
    const { data: usuario, error: errorSelect } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (errorSelect) throw errorSelect;
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que sea conductor (id_rol = 2)
    if (usuario.id_rol !== 2) {
      return res.status(403).json({ error: 'Solo los conductores pueden acceder a la app móvil' });
    }

    // Validar contraseña
    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crear token
    const token = jwt.sign(
      { id: usuario.id_usuario, id_rol: usuario.id_rol },
      process.env.JWT_SECRET || '12345fallback',
      { expiresIn: '8h' }
    );

    res.json({
      ok: true,
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        id_rol: usuario.id_rol,
        nombre: usuario.nombre,
        apellido: usuario.apellido
      }
    });

  } catch (error) {
    console.error("❌ Error login conductor:", error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// ============================================
// Obtener perfil del usuario autenticado (JWT)
// ============================================
exports.obtenerPerfil = async (req, res) => {
  try {
    // req.user viene del middleware verificarToken
    const userId = req.user.id;

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id_usuario, email, id_rol, nombre, apellido, fecha_creacion')
      .eq('id_usuario', userId)
      .single();

    if (error) throw error;
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error("❌ Error obtener perfil:", error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

