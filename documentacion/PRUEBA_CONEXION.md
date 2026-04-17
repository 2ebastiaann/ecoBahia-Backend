# 🔍 Guía para Probar la Conexión a la Base de Datos

Esta guía te ayudará a verificar que tu aplicación backend puede conectarse correctamente a la base de datos PostgreSQL.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

1. ✅ PostgreSQL instalado y corriendo
2. ✅ La base de datos `db_app_EcoBahia` o `EcoBahiaDB` creada
3. ✅ Extensión PostGIS habilitada (para datos geoespaciales)
4. ✅ Credenciales de acceso válidas

---

## 🚀 Método 1: Script de Prueba Automática (Recomendado)

### Paso 1: Configurar Variables de Entorno

Si aún no tienes un archivo `.env`, créalo copiando el ejemplo:

```bash
# En Windows PowerShell
cd ecoBahia\sistema-backend
copy .env.example .env
```

Edita el archivo `.env` con tus credenciales reales:

```env
# Configuración de la Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario_postgresql
DB_PASSWORD=tu_contraseña
DB_NAME=db_app_EcoBahia

# Configuración del Servidor
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANTE**: El nombre de la base de datos debe coincidir con el que tienes en pgAdmin.

### Paso 2: Instalar Dependencias (si aún no lo has hecho)

```bash
npm install
```

### Paso 3: Ejecutar el Script de Prueba

```bash
node test-db.js
```

### Resultado Esperado

**Si la conexión es exitosa, verás:**

```
🔍 Iniciando prueba de conexión a la base de datos...

📋 Configuración actual:
   Host: localhost
   Puerto: 5432
   Base de datos: db_app_EcoBahia
   Usuario: postgres

✅ Conexión a la base de datos establecida correctamente.

✅ PRUEBA EXITOSA: La conexión a la base de datos funciona correctamente.

🔍 Verificando existencia de tablas...

   ✅ Se encontraron 6 tablas:
      - barrios
      - horarios
      - posiciones
      - rutas
      - rutas_barrio
      - spatial_ref_sys

🎉 Todo está listo para usar la API!
```

**Si hay error, verás:**

```
❌ PRUEBA FALLIDA: Error al conectar con la base de datos.

Detalles del error:
[descripción del error]

💡 Soluciones comunes:
   1. Verifica que PostgreSQL esté corriendo
   2. Verifica las credenciales en el archivo .env
   3. Verifica que la base de datos exista
   4. Verifica que el puerto sea correcto (default: 5432)
```

---

## 🚀 Método 2: Probar Iniciando el Servidor

### Paso 1: Configurar .env

Igual que en el Método 1.

### Paso 2: Iniciar el Servidor

**Desarrollo**:
```bash
npm run dev
```

**Producción**:
```bash
npm start
```

### Resultado Esperado

Al iniciar el servidor, deberías ver en la consola:

```
✅ Conexión a la base de datos establecida correctamente.
✅ Modelos sincronizados con la base de datos
🚀 Servidor escuchando en http://localhost:3000
```

### Paso 3: Probar el Endpoint de Bienvenida

Abre tu navegador o usa curl:

```bash
# En PowerShell
curl http://localhost:3000/

# O abre en el navegador
# http://localhost:3000/
```

**Respuesta esperada:**

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

### Paso 4: Probar Endpoint de Datos

Intenta obtener datos de una tabla:

```bash
# Obtener todas las rutas
curl http://localhost:3000/api/rutas

# Obtener todos los barrios
curl http://localhost:3000/api/barrios
```

**Si la base de datos está conectada pero vacía**, verás:

```json
{
  "success": true,
  "data": []
}
```

**Si hay datos**, verás un array con los registros.

---

## 🔧 Solución de Problemas Comunes

### ❌ Error: "Timeout: Request exceeded"

**Causa**: PostgreSQL no está corriendo o el puerto es incorrecto.

**Solución**:
1. Verifica que el servicio PostgreSQL esté iniciado
2. En Windows: Abre "Servicios" y busca "postgresql"
3. Verifica que el puerto en `.env` sea el correcto (default: 5432)

---

### ❌ Error: "password authentication failed"

**Causa**: Usuario o contraseña incorrectos.

**Solución**:
1. Verifica las credenciales en el archivo `.env`
2. Prueba conectarte con pgAdmin usando las mismas credenciales
3. Verifica que el usuario tenga permisos en la base de datos

---

### ❌ Error: "database does not exist"

**Causa**: El nombre de la base de datos en `.env` no coincide con la BD real.

**Solución**:
1. Verifica el nombre de la BD en pgAdmin
2. Según la imagen que viste, el nombre correcto es: `db_app_EcoBahia`
3. Actualiza `DB_NAME=db_app_EcoBahia` en el archivo `.env`

---

### ❌ Error: "relation does not exist"

**Causa**: Las tablas no están creadas en la base de datos.

**Solución**:
1. Verifica en pgAdmin que las tablas existan:
   - `barrios`
   - `horarios`
   - `posiciones`
   - `rutas`
   - `rutas_barrio`
2. Si no existen, ejecuta el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   Esto ejecutará `sync({ alter: true })` que creará/modificará las tablas

---

### ❌ Error: "column 'createdAt' does not exist"

**Causa**: Conflicto con timestamps.

**Solución**:
- Ya está configurado `timestamps: false` en todos los modelos
- Si persiste, verifica el archivo `config/db.config.js`

---

### ⚠️ Advertencia: "Unknown column type"

**Causa**: Falta la extensión PostGIS.

**Solución**:

1. Conéctate a tu base de datos desde pgAdmin
2. Ejecuta el siguiente comando SQL:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## 🧪 Prueba Adicional: Verificar con pgAdmin

1. Abre pgAdmin
2. Conéctate a tu servidor PostgreSQL
3. Navega a: **Servers → PostgreSQL 17 → Databases → db_app_EcoBahia → Schemas → public → Tables**
4. Deberías ver las 6 tablas mencionadas anteriormente

---

## 📊 Verificación de Índices Espaciales (Opcional pero Recomendado)

Para mejorar el rendimiento de consultas geoespaciales, crea índices GIST:

```sql
-- Conéctate a db_app_EcoBahia en pgAdmin

-- Crear índices espaciales
CREATE INDEX IF NOT EXISTS rutas_shape_idx ON rutas USING GIST (shape);
CREATE INDEX IF NOT EXISTS barrios_geom_idx ON barrios USING GIST (geom);
CREATE INDEX IF NOT EXISTS posiciones_geom_idx ON posiciones USING GIST (geom);
```

---

## ✅ Checklist Final

Antes de considerar que todo funciona:

- [ ] El script `test-db.js` ejecuta sin errores
- [ ] El servidor inicia sin errores
- [ ] El endpoint `/` responde correctamente
- [ ] Los endpoints `/api/*` responden (aunque sea con arrays vacíos)
- [ ] Las tablas están creadas en pgAdmin
- [ ] PostGIS está habilitado
- [ ] Los índices espaciales están creados

---

## 📝 Notas Adicionales

1. **Modo Desarrollo**: El servidor muestra todas las consultas SQL cuando `NODE_ENV=development`

2. **Sincronización**: Solo se ejecuta en desarrollo. No afecta datos existentes.

3. **Logging**: Todos los errores se registran en la consola con detalles completos.

---

## 🎉 Siguiente Paso

Una vez que la conexión funcione, puedes:

1. Probar crear un registro desde la API
2. Verificar que se guarda en pgAdmin
3. Comenzar a desarrollar el frontend

---

**¿Necesitas ayuda adicional?** Consulta `DOCUMENTACION_TECNICA.md` para más detalles sobre la arquitectura y endpoints.

