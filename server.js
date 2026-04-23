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

// Configurar WebSockets para tracking
trackingSocket(io);

// ===============================
// 🚀 INICIAR BACKEND CON SUPABASE + WEBSOCKETS
// ===============================
(async () => {
    try {
        console.log('🚀 Iniciando backend con Supabase y Socket.IO...');

        // ATENCIÓN: 0.0.0.0 permite recibir tráfico externo
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🟢 Servidor corriendo en http://0.0.0.0:${PORT}`);
            console.log(`🌐 API y WebSockets listos externamente en :${PORT}`);
        });

    } catch (err) {
        console.error('❌ Error crítico al iniciar backend:', err);
        process.exit(1);
    }
})();
