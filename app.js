require('dotenv').config();

// Permitir certificados autofirmados o inválidos (necesario para la API del profesor)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors({
    origin: [
        'http://localhost:4200',
        'http://ecobahia.eleueleo.com',
        'http://localhost:8100',
        'capacitor://localhost',
        'http://localhost'
    ],
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

// Endpoint raíz
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido al Servidor Express EcoBahía',
        version: '1.0.0'
    });
});

module.exports = app;
