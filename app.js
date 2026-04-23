require('dotenv').config();

// Permitir certificados autofirmados o inválidos (necesario para la API del profesor)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');

const app = express();

// Orígenes CORS desde variable de entorno
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:4200', 'http://localhost:8100'];

app.use(cors({
    origin: corsOrigins,
    credentials: true
}));

app.use(express.json());

// Importar rutas
app.use('/api/rutas', require('./routes/ruta.routes'));
app.use('/api/usuarios', require('./routes/usuario.routes'));
app.use('/api/calles', require('./routes/calles.routes'));
app.use('/api/vehiculos', require('./routes/vehiculos.routes'));
app.use('/api/recorridos', require('./routes/recorridos.routes'));
app.use('/api/asignaciones', require('./routes/asignaciones.routes'));
app.use('/api/recorridos_locales', require('./routes/recorridos_locales.routes'));
app.use('/api/ubicaciones', require('./routes/ubicaciones.routes'));

// Endpoint raíz
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido al Servidor Express EcoBahía',
        version: '1.0.0'
    });
});

module.exports = app;
