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

module.exports = { verificarToken };
