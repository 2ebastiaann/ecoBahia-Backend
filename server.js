require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const trackingSocket = require('./sockets/tracking.socket');

const PORT = process.env.PORT || 3007;

// Crear servidor HTTP usando Express
const server = http.createServer(app);

// Configurar CORS desde variable de entorno o defaults
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:4200', 'http://localhost:8100'];

// Inicializar Socket.IO
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Exponer io a toda la app Express
app.set('socketio', io);

// Configurar WebSockets para tracking
trackingSocket(io);

// ===============================
// 🚀 INICIAR BACKEND CON POSTGRESQL + WEBSOCKETS
// ===============================
const db = require('./config/database');

(async () => {
    try {
        console.log('🚀 Iniciando backend con PostgreSQL y Socket.IO...');

        // Verificar conexión a PostgreSQL
        await db.testConnection();

        // ATENCIÓN: 0.0.0.0 permite recibir tráfico externo
        // server.js - Entry point del Backend (Trigger deploy)
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🟢 Servidor corriendo en http://0.0.0.0:${PORT}`);
            console.log(`🌐 API y WebSockets listos externamente en :${PORT}`);
        });

    } catch (err) {
        console.error('❌ Error crítico al iniciar backend:', err);
        process.exit(1);
    }
})();
