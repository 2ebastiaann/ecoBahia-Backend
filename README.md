# 🌊 EcoBahía — Backend REST API + WebSockets

Backend centralizado del sistema **EcoBahía** de gestión inteligente de recolección de residuos. Construido con **Node.js + Express + Socket.IO**, se comunica con una base de datos propia en **Supabase (PostgreSQL)** y sincroniza datos con la API externa del entorno universitario.

## 🧩 Rol en el sistema

| Componente | Función |
|---|---|
| 🧠 **Backend** (este repo) | API REST + WebSockets. Centraliza lógica, BD y sincronización externa |
| 📱 App móvil (Ionic/Angular) | Envía GPS del conductor en tiempo real |
| 🌐 Frontend web (Angular) | Panel de administrador: gestión y monitoreo en mapa |

---

## 🏗️ Estructura del proyecto

```text
Ecobahia-backend/
├── .env                            ← Variables de entorno (ver .env.example)
├── .env.example                    ← Plantilla de variables de entorno
├── app.js                          ← Configuración de Express (middlewares, CORS, rutas)
├── server.js                       ← Punto de entrada: levanta HTTP + Socket.IO
├── DockerFile                      ← Contenedor Docker para despliegue
├── package.json                    ← Dependencias del proyecto
│
├── config/                         ← Infraestructura de base de datos
│   ├── database.js                 ← Adaptador agnóstico (hoy Supabase, mañana PostgreSQL directo)
│   └── supabase.js                 ← Cliente Supabase (solo usado por database.js)
│
├── middleware/                     ← Middlewares de Express
│   └── auth.middleware.js          ← Verificación de JWT en rutas protegidas
│
├── routes/                         ← Endpoints REST expuestos
│   ├── usuario.routes.js           ← Login, registro, perfil, listar conductores
│   ├── vehiculos.routes.js         ← CRUD de vehículos
│   ├── ruta.routes.js              ← CRUD de rutas geográficas
│   ├── asignaciones.routes.js      ← Asignar conductor↔vehículo y vehículo↔ruta
│   ├── recorridos.routes.js        ← Proxy a la API externa (iniciar/finalizar)
│   ├── recorridos_locales.routes.js ← Gestión interna de recorridos (crear, activar, desactivar)
│   ├── ubicaciones.routes.js       ← Historial de posiciones y batch offline
│   └── calles.routes.js            ← Geometría de calles (API externa)
│
├── controlador/                    ← Lógica de negocio
│   ├── usuarios.controlador.js     ← Autenticación bcrypt + JWT
│   ├── vehiculos.controlador.js    ← Sincronización híbrida (BD local + API externa)
│   ├── ruta.controlador.js         ← Guarda rutas localmente y en la API externa
│   ├── asignaciones.controlador.js ← Validación de disponibilidad antes de asignar
│   ├── recorridos.controlador.js   ← Puente hacia la API externa
│   ├── recorridos_locales.controlador.js ← Crea recorridos en BD + API externa, guarda id_externo
│   ├── ubicaciones.controlador.js  ← Guardar posiciones GPS (individual y batch)
│   └── calles.controlador.js       ← Proxy a la API de calles
│
├── repositories/                   ← Capa de datos (queries a Supabase vía database.js)
│   ├── usuario.repository.js       ← findByEmail, create, findConductores, etc.
│   ├── vehiculo.repository.js      ← Espejo local de vehículos
│   ├── ruta.repository.js          ← Espejo local de rutas
│   ├── asignacion.repository.js    ← Consultas conductor↔vehículo, vehículo↔ruta
│   ├── recorrido.repository.js     ← CRUD recorridos + findIdExterno / updateExterno
│   └── posicion.repository.js      ← Insertar posiciones GPS con geometría PostGIS
│
├── services/                       ← Clientes HTTP para APIs externas
│   ├── httpClient.js               ← Cliente HTTP reutilizable (fetch + error handling)
│   └── apiRecoleccion/             ← Consumo de la API externa:
│       ├── vehiculos.service.js
│       ├── rutas.service.js
│       ├── recorridos.service.js    ← iniciarRecorrido, finalizarRecorrido, registrarPosicionExterna
│       └── calles.service.js
│
├── sockets/                        ← Comunicación en tiempo real
│   └── tracking.socket.js          ← Recibe GPS del móvil, guarda en BD, reenvía a API, emite a web
│                                      Incluye caché en memoria de posiciones activas
│
├── scripts/                        ← Utilidades de desarrollo
│   ├── create-user-remote.js
│   └── test-supabase.js
│
└── documentacion/                  ← Guías técnicas internas
```

---

## 🗄️ Tablas en Base de Datos

| Tabla | Descripción |
|---|---|
| `usuarios` | Administradores y conductores (con bcrypt + JWT) |
| `vehiculos` | Flota de vehículos (espejo de API externa) |
| `rutas` | Rutas geográficas con geometría PostGIS |
| `recorridos` | Asignaciones activas (ruta + vehículo + conductor + id_externo) |
| `posiciones` | Historial GPS con geometría PostGIS (punto) |
| `rol` | Roles de usuario (admin, conductor) |
| `conductor_vehiculo` | Asignación conductor ↔ vehículo |
| `vehiculo_ruta` | Asignación vehículo ↔ ruta |

---

## 📡 Tracking GPS en Tiempo Real (Socket.IO)

El sistema de tracking es el núcleo de la operación en vivo:

1. **Conductor inicia recorrido** → la app móvil conecta por WebSocket con JWT
2. **Envío continuo de GPS** → el servidor recibe `{ latitude, longitude, recorrido_id }`
3. **Procesamiento triple**:
   - Guarda la posición en la tabla `posiciones` (historial)
   - Reenvía la posición a la API externa del profesor
   - Emite la posición a todos los clientes web conectados (broadcast)
4. **Caché en memoria** → el servidor mantiene un `Map` con la última posición conocida de cada conductor activo. Cuando un nuevo cliente web se conecta, recibe inmediatamente todas las posiciones actuales sin esperar a que los conductores se muevan.
5. **Desconexión** → al desconectarse un conductor, se limpia su entrada de la caché.

---

## 🚀 Ejecutar el proyecto

```bash
# Instalar dependencias
npm install

# Copiar y configurar variables de entorno
cp .env.example .env

# Desarrollo (con recarga automática)
npm run dev

# Producción
npm start
```
