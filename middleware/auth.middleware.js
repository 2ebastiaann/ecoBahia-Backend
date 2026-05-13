// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar token JWT.
 * Extrae el token del header Authorization: Bearer <token>
 * y lo decodifica, adjuntando los datos al req.user
 */
function verificarToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar datos del usuario decodificado al request
    req.user = decoded; // { id, id_rol, iat, exp }
    next();
  } catch (error) {
    console.error('❌ Error en verificación de token:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/**
 * Middleware de Control de Acceso Basado en Roles (RBAC).
 * Debe usarse DESPUÉS de verificarToken.
 * Solo permite continuar si el usuario tiene rol de Administrador (id_rol = 1).
 * Roles: 1=Administrador, 2=Conductor, 3=Ciudadano/Anónimo
 */
function verificarAdmin(req, res, next) {
  if (req.user && req.user.id_rol === 1) {
    next();
  } else {
    return res.status(403).json({ error: 'Acceso denegado: Se requiere rol de administrador' });
  }
}

module.exports = { verificarToken, verificarAdmin };
