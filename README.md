# 🌊 EcoBahía - Backend Rest API

Este repositorio aloja la lógica central, base de datos y puentes API del proyecto **EcoBahía**. Está construido utilizando Node.js y Express, comunicándose doblemente con una base de datos propia alojada en **Supabase** y la API externa del entorno universitario proporcionada para mapas y geometría cartográfica.

## 🏗️ Arquitectura y Estructura del Backend (Express)

La estructura sigue un modelo estándar dividido por responsabilidades (Rutas → Controladores → Servicios).

```text
C:\Users\LENOVO\Ecobahia-backend\
├── .env                          ← Configuración secreta y variables de entorno.
├── app.js                        ← Raíz lógica de Express. Define Middlewares, CORS e inyecta Rutas.
├── server.js                     ← Punto de entrada de red. Levanta la API escuchando el puerto.
├── package.json                  ← Listado unificado de dependencias (express, supabase, bcrypt, etc).
│
├── config/                       ← Configuración de infraestructura
│   └── supabase.js               ← Cliente inicializado de base de datos Supabase, conecta con entorno de la nube.
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
├── controlador/                  ← Controladores (Lógica de negocio ejecutada desde la Ruta)
│   ├── asignaciones.controlador.js ← Gestiona comprobaciones evitando doble asignación, une tablas en Supabase.
│   ├── calles.controlador.js     ← Conecta las solicitudes Front → API externa de red vial.
│   ├── recorridos.controlador.js ← Puente lógico para inicializar recorridos foráneos.
│   ├── recorridos_locales.controlador.js ← Verifica disponibilidad de recursos antes de permitir un recorrido, sincroniza Supabase y externa API juntas.
│   ├── ruta.controlador.js       ← Guarda las polilíneas de la ruta (PostGIS y dual JSON). 
│   ├── usuarios.controlador.js   ← Cifra/Descifra (bcrypt), emite Web Tokens JWT y autentica.
│   └── vehiculos.controlador.js  ← Guarda los vehículos generados aplicando esquema híbrido (Supabase + Externo).
│
├── services/                     ← Consumidor de Terceros y Servicios Periféricos
│   └── apiRecoleccion.js         ← Librería central que ejecuta sub-peticiones `fetch` a la API docente usando `PERFIL_ID`. Centraliza toda la comunicación a esa nube externa.
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

### Ejecutar el Proyecto Backend

```bash
# Para entorno de desarrollo (con recarga automática):
npm run dev

# Para entorno normal:
npm run start
```
Confiormarás el levantamiento si la terminal devuelve un status en el puerto `:3007`.
