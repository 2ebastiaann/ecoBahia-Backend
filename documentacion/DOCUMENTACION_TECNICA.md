# Documentación Técnica - Backend EcoBahía

## 📋 Índice
1. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
2. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
3. [Estructura de Carpetas y Archivos](#estructura-de-carpetas-y-archivos)
4. [Modelos (Maquetas)](#modelos-maquetas)
5. [Controladores](#controladores)
6. [Rutas API](#rutas-api)
7. [Endpoints Disponibles](#endpoints-disponibles)
8. [Variables de Entorno](#variables-de-entorno)
9. [Uso del Sistema](#uso-del-sistema)

---

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize v6.37.7
- **Base de Datos**: PostgreSQL con PostGIS
- **Drivers**: pg, pg-hstore

### Patrón de Arquitectura
El proyecto sigue una arquitectura MVC (Modelo-Vista-Controlador):
- **Modelo**: Definiciones de datos en `maquetas/`
- **Vista**: Respuestas JSON de la API
- **Controlador**: Lógica de negocio en `controlador/`

---

## 🗄️ Configuración de la Base de Datos

### Archivo: `config/db.config.js`

**Descripción**: Configuración centralizada de Sequelize y conexión a PostgreSQL.

**Responsabilidades**:
- Crear instancia de Sequelize
- Configurar pool de conexiones
- Definir configuraciones globales de modelos
- Proporcionar función de test de conexión

**Configuración**:
```javascript
- Host: DB_HOST (env) o 'localhost'
- Puerto: DB_PORT (env) o 5432
- Usuario: DB_USER (env) o 'user'
- Contraseña: DB_PASSWORD (env) o 'password'
- Base de Datos: DB_NAME (env) o 'EcoBahiaDB'
- Dialecto: postgres
- Pool: max: 5, min: 0, acquire: 30000ms, idle: 10000ms
- Timestamps: deshabilitados globalmente
- Pluralización: congelada (freezeTableName: true)
```

**Funciones Exportadas**:
- `sequelize`: Instancia de Sequelize
- `testConnection()`: Verifica la conexión a la BD

---

## 📁 Estructura de Carpetas y Archivos

```
sistema-backend/
├── config/
│   └── db.config.js              # Configuración de Sequelize
├── maquetas/                      # Modelos de base de datos
│   ├── index.js                   # Exporta modelos y define relaciones
│   ├── ruta.maqueta.js            # Modelo de rutas
│   ├── barrio.maqueta.js          # Modelo de barrios
│   ├── ruta_barrio.maqueta.js     # Modelo de relación N:N
│   ├── horario.maqueta.js         # Modelo de horarios
│   └── posicion.maqueta.js        # Modelo de posiciones GPS
├── controlador/                   # Lógica de negocio
│   ├── ruta.controlador.js        # CRUD de rutas
│   ├── barrio.controlador.js      # CRUD de barrios
│   ├── horario.controlador.js     # CRUD de horarios
│   └── posicion.controlador.js    # CRUD de posiciones
├── rutas/                         # Rutas de Express
│   ├── ruta.rutas.js              # Endpoints de rutas
│   ├── barrio.rutas.js            # Endpoints de barrios
│   ├── horario.rutas.js           # Endpoints de horarios
│   └── posicion.rutas.js          # Endpoints de posiciones
├── server.js                      # Servidor Express principal
├── .env.example                   # Ejemplo de variables de entorno
├── .gitignore                     # Archivos ignorados por Git
├── package.json                   # Dependencias del proyecto
└── README.md                      # Documentación de instalación
```

---

## 🗂️ Modelos (Maquetas)

### Archivo: `maquetas/index.js`

**Descripción**: Archivo central que importa todos los modelos y define las relaciones entre ellos.

**Relaciones Definidas**:

1. **Ruta ↔ Barrio (N:N)**
   - Tabla intermedia: `rutas_barrio`
   - Alias Ruta→Barrio: `barrios`
   - Alias Barrio→Ruta: `rutas`

2. **Ruta → Horario (1:N)**
   - Una ruta tiene muchos horarios
   - Alias Horario→Ruta: `ruta`

3. **Posición**
   - Sin relaciones directas FK
   - Relacionado por `vehiculo_id`

**Exportaciones**:
- `Ruta`
- `Barrio`
- `RutaBarrio`
- `Horario`
- `Posicion`
- `sequelize`

---

### Archivo: `maquetas/ruta.maqueta.js`

**Tabla**: `rutas`

**Campos**:
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| `id` | UUID | Identificador único | Primary Key, Auto-generated |
| `nombre` | STRING | Nombre de la ruta | NOT NULL |
| `color_hex` | STRING | Color hexadecimal | NOT NULL |
| `shape` | GEOMETRY(LINESTRING, 4326) | Geometría de la ruta | NOT NULL |
| `longitud_m` | DECIMAL(10,2) | Longitud en metros | NULL |
| `activo` | BOOLEAN | Estado activo | NOT NULL, Default: true |

---

### Archivo: `maquetas/barrio.maqueta.js`

**Tabla**: `barrios`

**Campos**:
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| `id` | UUID | Identificador único | Primary Key, Auto-generated |
| `nombre` | STRING | Nombre del barrio | NOT NULL |
| `geom` | GEOMETRY | Polígono/MultiPolígono | NOT NULL, SRID 4326 |

---

### Archivo: `maquetas/ruta_barrio.maqueta.js`

**Tabla**: `rutas_barrio`

**Descripción**: Tabla intermedia para relación N:N entre rutas y barrios.

**Campos**:
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| `id` | UUID | Identificador único | Primary Key, Auto-generated |
| `ruta_id` | UUID | Foreign Key → rutas | NOT NULL |
| `barrio_id` | UUID | Foreign Key → barrios | NOT NULL |

---

### Archivo: `maquetas/horario.maqueta.js`

**Tabla**: `horarios`

**Campos**:
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| `id` | UUID | Identificador único | Primary Key, Auto-generated |
| `ruta_id` | UUID | Foreign Key → rutas | NOT NULL |
| `dia_semana` | INTEGER | Día de la semana | NOT NULL, 0-6 (0=domingo, 6=sábado) |
| `hora_inicio_plan` | TIME | Hora planificada de inicio | NOT NULL |
| `ventana_min` | SMALLINT | Duración estimada en minutos | NOT NULL |

**Validaciones**:
- `dia_semana`: min: 0, max: 6

---

### Archivo: `maquetas/posicion.maqueta.js`

**Tabla**: `posiciones`

**Campos**:
| Campo | Tipo | Descripción | Validaciones |
|-------|------|-------------|--------------|
| `id` | UUID | Identificador único | Primary Key, Auto-generated |
| `vehiculo_id` | STRING | ID del vehículo | NOT NULL |
| `geom` | GEOMETRY(POINT, 4326) | Coordenadas GPS | NOT NULL |
| `capturado_ts` | DATE | Timestamp de captura | NOT NULL, Default: NOW |

---

## 🎮 Controladores

Todos los controladores implementan operaciones CRUD completas con:
- Manejo de errores con try-catch
- Respuestas JSON estructuradas
- Códigos de estado HTTP apropiados
- Logging de errores en consola

### Archivo: `controlador/ruta.controlador.js`

**Métodos**:

1. **`crear(req, res)`**
   - Método: POST
   - Código: 201 (Created)
   - Body: `{ nombre, color_hex, shape, longitud_m, activo }`
   - Retorna: Ruta creada

2. **`obtenerTodos(req, res)`**
   - Método: GET
   - Código: 200 (OK)
   - Incluye: barrios relacionados, horarios relacionados
   - Retorna: Array de rutas

3. **`obtenerPorId(req, res)`**
   - Método: GET
   - Parámetros: `id` (UUID)
   - Código: 200 (OK) o 404 (Not Found)
   - Incluye: barrios relacionados, horarios relacionados
   - Retorna: Ruta única

4. **`actualizar(req, res)`**
   - Método: PUT
   - Parámetros: `id` (UUID)
   - Body: `{ nombre, color_hex, shape, longitud_m, activo }`
   - Código: 200 (OK) o 404 (Not Found)
   - Retorna: Ruta actualizada

5. **`eliminar(req, res)`**
   - Método: DELETE
   - Parámetros: `id` (UUID)
   - Código: 200 (OK) o 404 (Not Found)
   - Retorna: Mensaje de confirmación

---

### Archivo: `controlador/barrio.controlador.js`

**Métodos**: Similar a RutaControlador

1. **`crear(req, res)`**: POST - Crea barrio
2. **`obtenerTodos(req, res)`**: GET - Lista barrios con rutas
3. **`obtenerPorId(req, res)`**: GET - Barrio por ID con rutas
4. **`actualizar(req, res)`**: PUT - Actualiza barrio
5. **`eliminar(req, res)`**: DELETE - Elimina barrio

**Diferencias**:
- Body: `{ nombre, geom }`
- Incluye: rutas relacionadas (sin atributos intermedios)

---

### Archivo: `controlador/horario.controlador.js`

**Métodos**: Similar a RutaControlador

1. **`crear(req, res)`**: POST - Crea horario
2. **`obtenerTodos(req, res)`**: GET - Lista horarios con ruta
3. **`obtenerPorId(req, res)`**: GET - Horario por ID con ruta
4. **`actualizar(req, res)`**: PUT - Actualiza horario
5. **`eliminar(req, res)`**: DELETE - Elimina horario

**Diferencias**:
- Body: `{ ruta_id, dia_semana, hora_inicio_plan, ventana_min }`
- Incluye: ruta relacionada

---

### Archivo: `controlador/posicion.controlador.js`

**Métodos**:

1. **`crear(req, res)`**: POST - Crea posición
2. **`obtenerTodos(req, res)`**: GET - Lista posiciones (ordenadas por fecha DESC)
3. **`obtenerPorId(req, res)`**: GET - Posición por ID
4. **`obtenerPorVehiculo(req, res)`**: GET - Posiciones por vehículo
5. **`actualizar(req, res)`**: PUT - Actualiza posición
6. **`eliminar(req, res)`**: DELETE - Elimina posición

**Diferencias**:
- Body: `{ vehiculo_id, geom, capturado_ts }`
- Ordenamiento: Por `capturado_ts` DESC
- Endpoint adicional: `/api/posiciones/vehiculo/:vehiculo_id`

---

## 🛣️ Rutas API

Todos los archivos de rutas usan Express Router y conectan endpoints con métodos de controlador.

### Archivo: `rutas/ruta.rutas.js`

**Base**: `/api/rutas`

| Método | Endpoint | Controlador |
|--------|----------|-------------|
| POST | `/` | `crear` |
| GET | `/` | `obtenerTodos` |
| GET | `/:id` | `obtenerPorId` |
| PUT | `/:id` | `actualizar` |
| DELETE | `/:id` | `eliminar` |

---

### Archivo: `rutas/barrio.rutas.js`

**Base**: `/api/barrios`

| Método | Endpoint | Controlador |
|--------|----------|-------------|
| POST | `/` | `crear` |
| GET | `/` | `obtenerTodos` |
| GET | `/:id` | `obtenerPorId` |
| PUT | `/:id` | `actualizar` |
| DELETE | `/:id` | `eliminar` |

---

### Archivo: `rutas/horario.rutas.js`

**Base**: `/api/horarios`

| Método | Endpoint | Controlador |
|--------|----------|-------------|
| POST | `/` | `crear` |
| GET | `/` | `obtenerTodos` |
| GET | `/:id` | `obtenerPorId` |
| PUT | `/:id` | `actualizar` |
| DELETE | `/:id` | `eliminar` |

---

### Archivo: `rutas/posicion.rutas.js`

**Base**: `/api/posiciones`

| Método | Endpoint | Controlador |
|--------|----------|-------------|
| POST | `/` | `crear` |
| GET | `/` | `obtenerTodos` |
| GET | `/vehiculo/:vehiculo_id` | `obtenerPorVehiculo` |
| GET | `/:id` | `obtenerPorId` |
| PUT | `/:id` | `actualizar` |
| DELETE | `/:id` | `eliminar` |

**Nota**: El orden importa. Endpoints con parámetros específicos (`/vehiculo/:vehiculo_id`) deben ir antes de los genéricos (`/:id`).

---

## 🌐 Endpoints Disponibles

### Endpoint Raíz

**GET** `/`

**Descripción**: Información del servidor y endpoints disponibles.

**Respuesta**:
```json
{
  "message": "Bienvenido al Servidor Express EcoBahía",
  "version": "1.0.0",
  "endpoints": {
    "rutas": "/api/rutas",
    "barrios": "/api/barrios",
    "horarios": "/api/horarios",
    "posiciones": "/api/posiciones"
  }
}
```

---

### Rutas

**Base**: `/api/rutas`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| POST | `/` | Crear ruta | Body: nombre, color_hex, shape, longitud_m, activo |
| GET | `/` | Listar todas las rutas | - |
| GET | `/:id` | Obtener ruta por ID | Params: id |
| PUT | `/:id` | Actualizar ruta | Params: id, Body: campos a actualizar |
| DELETE | `/:id` | Eliminar ruta | Params: id |

**Respuesta Ejemplo - Crear**:
```json
{
  "success": true,
  "message": "Ruta creada exitosamente",
  "data": {
    "id": "uuid-generado",
    "nombre": "Ruta Centro-Norte",
    "color_hex": "#FF0000",
    "shape": "...",
    "longitud_m": 1500.50,
    "activo": true
  }
}
```

---

### Barrios

**Base**: `/api/barrios`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| POST | `/` | Crear barrio | Body: nombre, geom |
| GET | `/` | Listar todos los barrios | - |
| GET | `/:id` | Obtener barrio por ID | Params: id |
| PUT | `/:id` | Actualizar barrio | Params: id, Body: campos a actualizar |
| DELETE | `/:id` | Eliminar barrio | Params: id |

**Respuesta Ejemplo - Listar**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Centro",
      "geom": "...",
      "rutas": []
    }
  ]
}
```

---

### Horarios

**Base**: `/api/horarios`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| POST | `/` | Crear horario | Body: ruta_id, dia_semana, hora_inicio_plan, ventana_min |
| GET | `/` | Listar todos los horarios | - |
| GET | `/:id` | Obtener horario por ID | Params: id |
| PUT | `/:id` | Actualizar horario | Params: id, Body: campos a actualizar |
| DELETE | `/:id` | Eliminar horario | Params: id |

**Body Ejemplo - Crear**:
```json
{
  "ruta_id": "uuid-de-ruta",
  "dia_semana": 1,
  "hora_inicio_plan": "08:00:00",
  "ventana_min": 30
}
```

---

### Posiciones

**Base**: `/api/posiciones`

| Método | Endpoint | Descripción | Body/Params |
|--------|----------|-------------|-------------|
| POST | `/` | Crear posición | Body: vehiculo_id, geom, capturado_ts |
| GET | `/` | Listar todas las posiciones | - |
| GET | `/vehiculo/:vehiculo_id` | Obtener posiciones por vehículo | Params: vehiculo_id |
| GET | `/:id` | Obtener posición por ID | Params: id |
| PUT | `/:id` | Actualizar posición | Params: id, Body: campos a actualizar |
| DELETE | `/:id` | Eliminar posición | Params: id |

**Respuesta Ejemplo - Por Vehículo**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "vehiculo_id": "BUS-123",
      "geom": "...",
      "capturado_ts": "2025-02-11T18:00:00.000Z"
    }
  ]
}
```

---

## 🔐 Variables de Entorno

### Archivo: `.env` (no versionado)

Variables requeridas:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=EcoBahiaDB

# Servidor
PORT=3000
NODE_ENV=development
```

### Archivo: `.env.example` (versionado)

Plantilla de ejemplo para nuevos desarrolladores.

---

## 🚀 Uso del Sistema

### 1. Instalación

```bash
cd ecoBahia/sistema-backend
npm install
```

### 2. Configuración

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Ejecución

**Desarrollo**:
```bash
npm run dev
```

**Producción**:
```bash
npm start
```

### 4. Verificación

El servidor inicia en `http://localhost:3000`

Verificar salud:
```bash
curl http://localhost:3000/
```

---

## 📊 Base de Datos

### Tablas Principales

1. **rutas**: Almacena información de rutas de transporte
2. **barrios**: Almacena información de barrios
3. **rutas_barrio**: Tabla intermedia para relación N:N
4. **horarios**: Almacena horarios de operación de rutas
5. **posiciones**: Almacena posiciones GPS de vehículos
6. **spatial_ref_sys**: Tabla del sistema PostGIS (no modificable)

### Requisitos PostGIS

La base de datos requiere PostGIS para datos geoespaciales:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Índices Espaciales

Se recomienda crear índices GIST para búsquedas espaciales:

```sql
CREATE INDEX rutas_shape_idx ON rutas USING GIST (shape);
CREATE INDEX barrios_geom_idx ON barrios USING GIST (geom);
CREATE INDEX posiciones_geom_idx ON posiciones USING GIST (geom);
```

---

## 🔍 Debugging

### Logs en Desarrollo

En modo desarrollo, Sequelize muestra todas las consultas SQL:
- `logging: true` cuando `NODE_ENV=development`

### Manejo de Errores

Todos los controladores implementan:
- Try-catch para capturar errores
- Logging en consola de errores
- Respuestas estructuradas con mensajes claros

**Formato de Error**:
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos"
}
```

---

## 📝 Notas Importantes

1. **Timestamps**: Desactivados globalmente
2. **Sincronización**: Solo en desarrollo (`sync({ alter: true })`)
3. **UUID**: Generados automáticamente en el cliente
4. **Geometrías**: Formato GeoJSON esperado
5. **Relaciones**: Carga eager con `include` en consultas

---

## 🔄 Flujo de Datos

```
Cliente HTTP
    ↓
Express Router (rutas/)
    ↓
Controlador (controlador/)
    ↓
Modelo Sequelize (maquetas/)
    ↓
PostgreSQL + PostGIS
    ↓
Respuesta JSON
```

---

## 📌 Changelog

### v1.0.0 (Actual)
- Implementación inicial de CRUD completo
- Soporte para datos geoespaciales
- Relaciones N:N y 1:N configuradas
- Manejo robusto de errores
- Documentación completa

---

**Documentación generada**: Febrero 2025  
**Versión**: 1.0.0  
**Autor**: Sistema EcoBahía Backend Team

