# 🌊 EcoBahía - Backend Rest API

Este repositorio aloja la lógica central, base de datos y puentes API del proyecto **EcoBahía**. Está construido utilizando Node.js y Express, comunicándose doblemente con una base de datos propia alojada en **Supabase** y la API externa del entorno universitario proporcionada para mapas y geometría cartográfica.

## 🏗️ Arquitectura y Estructura del Backend (Express)

La estructura sigue un modelo estándar dividido por responsabilidades (Rutas → Controladores → Servicios).

```text
C:\Users\LENOVO\Ecobahia-backend\
├── .env                          ← Configuración secreta y variables de entorno.
├── app.js                        ← Raíz lógica de Express. Define Middlewares, CORS e inyecta Rutas.
├── server.js                     ← Punto de entrada de red. Levanta la API escuchando el puerto.
├── package.json                  ← Listado unificado de dependencias.
│
├── config/                       ← Configuración de infraestructura
│   ├── database.js               ← Adaptador agnóstico de base de datos (Supabase actual / PostgreSQL futuro).
│   └── supabase.js               ← Cliente de base de datos Supabase (No usado directamente por los controladores).
│
├── routes/                       ← Enrutamiento (Endpoints expuestos por la API hacia el Frontend)
│   ├── asignaciones.routes.js    ← Endpoints REST para asignar vehículo↔conductor y vehículo↔ruta.
│   ├── calles.routes.js          ← Endpoints GET devolviendo información geométrica de calles.
│   ├── recorridos.routes.js      ← Endpoints para activar inicio y final de recorridos en el sistema.
│   ├── recorridos_locales.routes.js ← Endpoints internos para listado de trayectorias activadas.
│   ├── ruta.routes.js            ← Endpoints REST CRUD para rutas geográficas.
│   ├── usuario.routes.js         ← Endpoints de Login, validación y gestión de administradores y conductores.
│   └── vehiculos.routes.js       ← Endpoints para la gestión íntegra del catálogo de los vehículos.
│
├── controlador/                  ← Controladores (Lógica de negocio y respuesta de la API)
│   ├── asignaciones.controlador.js ← Gestiona vinculación validando que estén disponibles, usa Repositories.
│   ├── calles.controlador.js     ← Conecta las solicitudes Front → API externa de red vial vía Servicios.
│   ├── recorridos.controlador.js ← Puente lógico para inicializar recorridos foráneos.
│   ├── recorridos_locales.controlador.js ← Verifica recursos disponibles antes de permitir recorrido y sincroniza BD Local y externa.
│   ├── ruta.controlador.js       ← Guarda las polilíneas de la ruta localmente y en el exterior. 
│   ├── usuarios.controlador.js   ← Cifra/Descifra (bcrypt), emite Web Tokens JWT y autentica. Llama a Repository.
│   └── vehiculos.controlador.js  ← Guarda los vehículos generados aplicando esquema híbrido (BD Local + Externo).
│
├── repositories/                 ← Capa de Datos (Aísla consultas a las tablas mediante 'database.js')
│   ├── asignacion.repository.js  ← Queries para asignaciones conductor↔vehículo y vehículo↔ruta.
│   ├── recorrido.repository.js   ← Queries para listar y manejar registros de recorridos activos/históricos.
│   ├── ruta.repository.js        ← Guarda copias (espejo) de rutas en la BD local.
│   ├── usuario.repository.js     ← Métodos modulares (findByEmail, create, findConductores, etc.) para usuarios.
│   └── vehiculo.repository.js    ← Guarda copias (espejo) de vehículos creados para BD local.
│
├── services/                     ← Consumidor de Tercería y Acceso Red
│   ├── httpClient.js             ← Cliente HTTP reutilizable con manejo centralizado de errores y cabeceras automáticas (Accept: application/json).
│   └── apiRecoleccion/           ← Interfaz modular que consume la API del docente:
│       ├── calles.service.js     ← Peticiones relativas a las Calles.
│       ├── recorridos.service.js ← Peticiones relativas a manejo remoto de Recorridos.
│       ├── rutas.service.js      ← Peticiones integrales de Rutas externas.
│       └── vehiculos.service.js  ← Peticiones integrales de Vehículos externos.
│
├── sockets/                      ← Comunicación bidireccional en Tiempo Real (WebSockets)
│   └── tracking.socket.js        ← Middleware de autenticación, recepción de coordenadas (App Móvil), re-emisión a App Web y sincronización oculta de posiciones (fire-and-forget) a la API Externa.
│
├── scripts/                      ← Scripts utilitarios (No ejecutados en producción rutinaria)
│   ├── create-user-remote.js     ← Puente SSH con cliente Postgres puro para intervenciones DB rudas.
│   └── test-supabase.js          ← Utilidad breve para confirmar respuesta rápida en un PING hacia Supabase.
│
└── docs/                         ← Documentación Interna y Guías Técnicas Antiguas/Recientes.
    ├── DOCUMENTACION_TECNICA.md
    ├── INSTRUCCIONES_CONEXION.md
    └── PRUEBA_CONEXION.md
```

## 📡 Arquitectura de Rastreo GPS y Sincronización Externa

El backend maneja un flujo híbrido para el tracking en vivo:
1. **Memoria Local**: Al recibir `conductor:location`, guarda la latitud/longitud de manera persistente en Supabase (`PosicionRepository`).
2. **Sincronización Silenciosa**: Utiliza un mapeo de UUIDs (guardando el `id_externo` de la API del profesor en la tabla local `recorridos`) para enviar la posición a la API Externa en segundo plano, sin bloquear el servidor.
3. **Emisión en Tiempo Real**: Funciona como "Megáfono" (`io.emit`), enviando los eventos `location:update` y `conductor:disconnected` directamente a la App Web Administrativa para actualizar los mapas sin recargar la página.

### Ejecutar el Proyecto Backend

```bash
# Para entorno de desarrollo (con recarga automática):
npm run dev

# Para entorno normal:
npm run start
```
Confiormarás el levantamiento si la terminal devuelve un status en el puerto `:3007`.
