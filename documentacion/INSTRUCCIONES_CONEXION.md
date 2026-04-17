# 🔌 Instrucciones Rápidas para Probar la Conexión

## ✅ Ya está todo listo

He preparado un script especial para probar tu conexión a la base de datos.

---

## 🚀 Pasos para Probar la Conexión

### Paso 1: Crear archivo .env

Necesitas crear un archivo `.env` en la carpeta `ecoBahia/sistema-backend/` con tus credenciales reales.

**En Windows PowerShell:**

```powershell
cd ecoBahia\sistema-backend
copy .env.example .env
```

Luego edita el archivo `.env` con un editor de texto y coloca tus credenciales reales:

```env
# Configuración de la Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=TuContraseñaReal
DB_NAME=db_app_EcoBahia

# Configuración del Servidor
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANTE**:
- Reemplaza `TuContraseñaReal` con la contraseña real de PostgreSQL
- Reemplaza `postgres` con tu usuario real si es diferente
- **Según la imagen de pgAdmin que viste, el nombre de la base de datos debería ser: `db_app_EcoBahia`**

---

### Paso 2: Ejecutar el Script de Prueba

Una vez que hayas creado y configurado el archivo `.env`, ejecuta:

```powershell
node test-db.js
```

---

### Paso 3: Interpretar los Resultados

#### ✅ Si funciona correctamente:

Verás algo como esto:

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

**¡Felicidades! Tu conexión funciona perfectamente.**

---

#### ❌ Si hay errores:

Verás algo como esto:

```
❌ PRUEBA FALLIDA: Error al conectar con la base de datos.

Detalles del error:
la autentificacin password fall para el usuariopostgres
```

**Soluciones:**

1. **"password authentication failed"**
   - Verifica que la contraseña en `.env` sea correcta
   - Prueba conectarte con pgAdmin usando las mismas credenciales

2. **"database does not exist"**
   - Verifica el nombre de la base de datos en `.env`
   - Debería ser exactamente: `db_app_EcoBahia`

3. **"Timeout" o "Connection refused"**
   - Verifica que PostgreSQL esté corriendo
   - En Windows: Abre "Servicios" y busca "postgresql"

4. **"relation does not exist"**
   - Las tablas no están creadas
   - Sigue las instrucciones de "Crear Tablas" más abajo

---

## 🗄️ Crear Tablas (si no existen)

Si el script te dice que no encuentra tablas, necesitas crearlas o sincronizarlas.

### Opción A: Sincronización Automática

Ejecuta el servidor en modo desarrollo:

```powershell
npm run dev
```

Esto creará las tablas automáticamente si no existen.

### Opción B: Verificar en pgAdmin

1. Abre pgAdmin
2. Navega a: `Servers → PostgreSQL 17 → Databases → db_app_EcoBahia → Schemas → public → Tables`
3. Deberías ver estas tablas:
   - `barrios`
   - `horarios`
   - `posiciones`
   - `rutas`
   - `rutas_barrio`
   - `spatial_ref_sys`

---

## 🔍 Habilitar PostGIS (Si es necesario)

Si ves errores relacionados con geometrías, necesitas habilitar PostGIS:

1. Conéctate a tu base de datos desde pgAdmin
2. Ejecuta este comando SQL:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## ▶️ Iniciar el Servidor

Una vez que la prueba de conexión sea exitosa, puedes iniciar el servidor:

```powershell
# Modo desarrollo (recomendado)
npm run dev

# Modo producción
npm start
```

Deberías ver:

```
✅ Conexión a la base de datos establecida correctamente.
✅ Modelos sincronizados con la base de datos
🚀 Servidor escuchando en http://localhost:3000
```

---

## 🧪 Probar los Endpoints

Una vez que el servidor esté corriendo:

### 1. Probar endpoint de bienvenida:

```powershell
curl http://localhost:3000/
```

### 2. Probar endpoints de datos:

```powershell
# Obtener todas las rutas
curl http://localhost:3000/api/rutas

# Obtener todos los barrios
curl http://localhost:3000/api/barrios
```

**Respuesta esperada (si la BD está vacía):**

```json
{
  "success": true,
  "data": []
}
```

---

## 📚 Más Información

Para más detalles, consulta:
- **PRUEBA_CONEXION.md**: Guía completa de troubleshooting
- **DOCUMENTACION_TECNICA.md**: Documentación técnica completa

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo usar el script sin crear .env?**
R: Sí, pero usará valores por defecto que probablemente no funcionen.

**P: ¿El script modifica datos?**
R: No, solo lee. Es completamente seguro.

**P: ¿Qué pasa si la contraseña tiene caracteres especiales?**
R: Usa comillas en el archivo `.env` si es necesario, pero generalmente no son necesarias.

**P: ¿Necesito crear las tablas manualmente?**
R: No, el servidor las creará automáticamente en desarrollo.

---

**¿Listo para empezar?** Ejecuta `node test-db.js` y verás si todo está funcionando! 🚀

