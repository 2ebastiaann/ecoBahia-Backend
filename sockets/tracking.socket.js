// sockets/tracking.socket.js
const jwt = require('jsonwebtoken');
const PosicionRepository = require('../repositories/posicion.repository');
const RecorridoRepository = require('../repositories/recorrido.repository');
const { registrarPosicionExterna } = require('../services/apiRecoleccion/recorridos.service');

// Caché en memoria para guardar la última posición conocida de los conductores activos
const activeTrucksCache = new Map();

module.exports = (io) => {
  // Middleware de autenticación para Socket.IO
  io.use((socket, next) => {
    try {
      // El token puede venir en auth.token (cliente Socket.IO) o headers
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      
      if (!token) {
        console.warn('⚠️ Intento de conexión Socket.IO sin token.');
        return next(new Error('Authentication error: Token no proporcionado'));
      }

      // Si el token incluye 'Bearer ', lo removemos
      if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Adjuntamos los datos del usuario decodificado al socket
      next();
    } catch (error) {
      console.error('❌ Error de autenticación en WebSocket:');
      console.error('   - Mensaje interno:', error.message);
      console.error('   - Token recibido:', socket.handshake.auth?.token);
      console.error('   - JWT_SECRET existe?:', !!process.env.JWT_SECRET);
      next(new Error('Authentication error: Token inválido o expirado'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`📡 Cliente conectado [${socket.id}] - Usuario ID: ${socket.user?.id}`);

    // Emitir evento de conexión de conductor a los demás
    if (socket.user) {
      io.emit('conductor:connected', { 
        conductor_id: socket.user.id, 
        timestamp: Date.now() 
      });
    }

    // ⭐ FIX: Cuando un nuevo cliente (ej. panel web) se conecta,
    // le enviamos inmediatamente las últimas posiciones conocidas.
    if (activeTrucksCache.size > 0) {
      activeTrucksCache.forEach((data) => {
        socket.emit('location:update', data);
      });
    }

    // 📍 Evento principal: recepción de ubicación del conductor
    socket.on('conductor:location', async (data) => {
      try {
        const { conductor_id, recorrido_id, location } = data;

        // 1. Validar datos requeridos
        if (!conductor_id || !recorrido_id || !location || location.latitude === undefined || location.longitude === undefined) {
          console.warn('⚠️ Payload inválido en conductor:location:', data);
          return;
        }

        const lat = location.latitude;
        const lon = location.longitude;
        const timestamp = location.timestamp ? new Date(location.timestamp).toISOString() : new Date().toISOString();

        // 2. Guardar en base de datos local
        await PosicionRepository.create({
          lat,
          lon,
          perfil_id: conductor_id,
          recorrido_id
        });

        // 3. Enviar a la API del Profesor de manera asíncrona (fire-and-forget)
        RecorridoRepository.findIdExterno(recorrido_id).then(id_externo => {
          if (id_externo) {
            // Usamos PERFIL_ID del .env (identidad ante la API del profesor)
            registrarPosicionExterna(id_externo, {
              lat,
              lon,
              perfil_id: process.env.PERFIL_ID
            }).catch(err => {
              console.error('⚠️ Error al enviar posición a la API del profesor:', err.message);
            });
          }
        }).catch(err => console.error('⚠️ Error al buscar id_externo:', err.message));

        const updateData = {
          conductor_id,
          recorrido_id,
          latitude: lat,
          longitude: lon,
          timestamp
        };

        // ⭐ Guardamos la posición en caché para los futuros clientes que se conecten
        activeTrucksCache.set(conductor_id, updateData);

        // 4. Emitir evento a TODOS los clientes conectados (App Web)
        io.emit('location:update', updateData);

      } catch (error) {
        console.error('❌ Error procesando conductor:location:', error);
      }
    });

    // Evento de desconexión
    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado [${socket.id}] - Usuario ID: ${socket.user?.id}`);
      
      if (socket.user) {
        // Si es el conductor quien se desconecta, lo limpiamos de la caché
        if (activeTrucksCache.has(socket.user.id)) {
          activeTrucksCache.delete(socket.user.id);
        }

        io.emit('conductor:disconnected', { 
          conductor_id: socket.user.id, 
          timestamp: Date.now() 
        });
      }
    });
  });
};
