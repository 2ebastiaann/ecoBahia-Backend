require('dotenv').config();

// ⚠️  SOLO DESARROLLO: desactiva validación de certificados SSL para la API del profesor.
// NUNCA habilitar en producción — viola la seguridad HTTPS y la Ley 1581.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


const express = require('express');
const cors = require('cors');

const app = express();

// Orígenes CORS permitidos explícitamente (producción)
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : [];

// Función dinámica de CORS:
// — Cualquier localhost (sin importar el puerto) se permite en desarrollo.
// — En producción valida contra la lista CORS_ORIGINS del entorno Railway.
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman / Capacitor nativo
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para el origen: ${origin}`));
  },
  credentials: true
}));

// Aumentamos el límite del body a 10mb para permitir las imágenes en base64 de los reportes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Importar rutas
app.use('/api/rutas', require('./routes/ruta.routes'));
app.use('/api/usuarios', require('./routes/usuario.routes'));
app.use('/api/calles', require('./routes/calles.routes'));
app.use('/api/vehiculos', require('./routes/vehiculos.routes'));
app.use('/api/recorridos', require('./routes/recorridos.routes'));
app.use('/api/asignaciones', require('./routes/asignaciones.routes'));
app.use('/api/ubicaciones', require('./routes/ubicaciones.routes'));
app.use('/api/reportes', require('./routes/reportes.routes'));

// Endpoint raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido al Servidor Express EcoBahía',
    version: '1.0.0'
  });
});

module.exports = app;
