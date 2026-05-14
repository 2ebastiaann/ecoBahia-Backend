// config/database.js
// ============================================================
// DATABASE ADAPTER — PostgreSQL con pg Pool
// ============================================================
// Migración completada: Supabase → PostgreSQL directo
//
// REGLA: ningún archivo fuera de config/ debe saber qué BD se usa.
//        Controllers y repositories SOLO llaman métodos genéricos.
// ============================================================

const { Pool } = require('pg');

// ──────────────────────────────────────────────
// Pool de conexiones PostgreSQL
// ──────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  user:     process.env.DB_USER     || 'ecobahia',
  password: process.env.DB_PASSWORD || 'ecobahia_secret_2026',
  database: process.env.DB_NAME     || 'ecobahia_db',
  max:      20,                      // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log de conexión exitosa al iniciar
pool.on('connect', () => {
  console.log('🐘 Nueva conexión PostgreSQL establecida');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool PostgreSQL:', err);
});

// ──────────────────────────────────────────────
// Helpers internos
// ──────────────────────────────────────────────

/**
 * Construye una cláusula WHERE a partir de un objeto de filtros
 * @param {object} filters - { columna: valor }
 * @param {number} startIndex - Índice inicial para parámetros $N
 * @returns {{ clause: string, values: Array }}
 */
function buildWhereClause(filters, startIndex = 1) {
  const keys = Object.keys(filters);
  if (keys.length === 0) return { clause: '', values: [] };

  const conditions = keys.map((key, i) => `"${key}" = $${startIndex + i}`);
  return {
    clause: `WHERE ${conditions.join(' AND ')}`,
    values: Object.values(filters),
  };
}

/**
 * Construye una cláusula ORDER BY
 * @param {object|null} order - { column, ascending }
 * @returns {string}
 */
function buildOrderClause(order) {
  if (!order) return '';
  const dir = order.ascending ? 'ASC' : 'DESC';
  return `ORDER BY "${order.column}" ${dir}`;
}


// ──────────────────────────────────────────────
// API pública — misma interfaz que el adapter anterior
// ──────────────────────────────────────────────

const db = {
  // ==========================================================
  // FIND ALL — SELECT múltiple con filtros de igualdad
  // ==========================================================
  // @param {string} table
  // @param {object} options.columns  - Columnas (default '*')
  // @param {object} options.filters  - Filtros { col: val } (AND)
  // @param {object} options.order    - { column, ascending }
  // @returns {Promise<Array>}
  async findAll(table, { columns = '*', filters = {}, order = null } = {}) {
    const { clause, values } = buildWhereClause(filters);
    const orderClause = buildOrderClause(order);

    const sql = `SELECT ${columns} FROM "${table}" ${clause} ${orderClause}`;
    const { rows } = await pool.query(sql, values);
    return rows;
  },

  // ==========================================================
  // FIND ALL WITH OR — SELECT con filtros AND + OR combinados
  // ==========================================================
  // Permite: WHERE activo = true AND (ruta_id = X OR vehiculo_id = Y OR perfil_id = Z)
  //
  // @param {string} table
  // @param {object} options.columns  - Columnas (default '*')
  // @param {object} options.filters  - Filtros de igualdad AND
  // @param {Array}  options.orConditions - Array de { column, value } para OR
  // @param {object} options.order    - { column, ascending }
  // @returns {Promise<Array>}
  async findAllWithOr(table, { columns = '*', filters = {}, orConditions = [], order = null } = {}) {
    const filterKeys = Object.keys(filters);
    const filterValues = Object.values(filters);
    let paramIndex = 1;
    let whereParts = [];

    // Filtros AND
    for (const key of filterKeys) {
      whereParts.push(`"${key}" = $${paramIndex++}`);
    }

    // Condiciones OR
    const allValues = [...filterValues];
    if (orConditions.length > 0) {
      const orParts = orConditions.map(cond => {
        allValues.push(cond.value);
        return `"${cond.column}" = $${paramIndex++}`;
      });
      whereParts.push(`(${orParts.join(' OR ')})`);
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
    const orderClause = buildOrderClause(order);

    const sql = `SELECT ${columns} FROM "${table}" ${whereClause} ${orderClause}`;
    const { rows } = await pool.query(sql, allValues);
    return rows;
  },

  // ==========================================================
  // FIND ONE — SELECT un solo registro
  // ==========================================================
  // @returns {Promise<object|null>}
  async findOne(table, { columns = '*', filters = {}, order = null } = {}) {
    const { clause, values } = buildWhereClause(filters);
    const orderClause = buildOrderClause(order);

    const sql = `SELECT ${columns} FROM "${table}" ${clause} ${orderClause} LIMIT 1`;
    const { rows } = await pool.query(sql, values);
    return rows[0] || null;
  },

  // ==========================================================
  // INSERT — Insertar y retornar el registro creado
  // ==========================================================
  // @returns {Promise<object>}
  async insert(table, record) {
    const keys = Object.keys(record);
    const values = Object.values(record);
    const placeholders = keys.map((_, i) => `$${i + 1}`);

    // Convertir objetos GeoJSON a ST_GeomFromGeoJSON para PostGIS
    const columns = keys.map(k => `"${k}"`);
    const valuePlaceholders = keys.map((key, i) => {
      if (key === 'geom' && typeof record[key] === 'object') {
        return `ST_GeomFromGeoJSON($${i + 1})`;
      }
      return `$${i + 1}`;
    });

    // Serializar objetos GeoJSON a string para ST_GeomFromGeoJSON
    const processedValues = values.map((val, i) => {
      if (keys[i] === 'geom' && typeof val === 'object') {
        return JSON.stringify(val);
      }
      return val;
    });

    const sql = `INSERT INTO "${table}" (${columns.join(', ')}) VALUES (${valuePlaceholders.join(', ')}) RETURNING *`;
    const { rows } = await pool.query(sql, processedValues);
    return rows[0];
  },

  // ==========================================================
  // INSERT NO RETURN — Insertar sin retornar (espejos, logs)
  // ==========================================================
  async insertNoReturn(table, record) {
    const keys = Object.keys(record);
    const values = Object.values(record);

    const columns = keys.map(k => `"${k}"`);
    const valuePlaceholders = keys.map((key, i) => {
      if (key === 'geom' && typeof record[key] === 'object') {
        return `ST_GeomFromGeoJSON($${i + 1})`;
      }
      return `$${i + 1}`;
    });

    const processedValues = values.map((val, i) => {
      if (keys[i] === 'geom' && typeof val === 'object') {
        return JSON.stringify(val);
      }
      return val;
    });

    const sql = `INSERT INTO "${table}" (${columns.join(', ')}) VALUES (${valuePlaceholders.join(', ')})`;
    await pool.query(sql, processedValues);
  },

  // ==========================================================
  // UPDATE — Actualizar registros por filtros
  // ==========================================================
  // @param {object} filters - { columna: valor } para WHERE
  // @param {object} updates - Campos a actualizar
  // @returns {Promise<object>}
  async update(table, filters, updates) {
    const updateKeys = Object.keys(updates);
    const updateValues = Object.values(updates);
    let paramIndex = 1;

    const setClauses = updateKeys.map(key => `"${key}" = $${paramIndex++}`);

    const filterKeys = Object.keys(filters);
    const filterValues = Object.values(filters);
    const whereClauses = filterKeys.map(key => `"${key}" = $${paramIndex++}`);

    const allValues = [...updateValues, ...filterValues];

    const sql = `UPDATE "${table}" SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')} RETURNING *`;
    const { rows } = await pool.query(sql, allValues);
    return rows[0];
  },

  // ==========================================================
  // REMOVE — Eliminar registros por filtros
  // ==========================================================
  async remove(table, filters) {
    const { clause, values } = buildWhereClause(filters);
    const sql = `DELETE FROM "${table}" ${clause}`;
    await pool.query(sql, values);
  },

  // ==========================================================
  // RAW QUERY — Para consultas complejas que no encajan arriba
  // ==========================================================
  async query(sql, params = []) {
    const { rows } = await pool.query(sql, params);
    return rows;
  },

  // ==========================================================
  // TEST CONNECTION — Verificar conexión a la BD
  // ==========================================================
  async testConnection() {
    try {
      const { rows } = await pool.query('SELECT NOW() AS server_time');
      console.log('🟢 PostgreSQL conectado:', rows[0].server_time);
      return true;
    } catch (err) {
      console.error('❌ No se pudo conectar a PostgreSQL:', err.message);
      return false;
    }
  },

  // Exponer pool para casos avanzados (transacciones, etc.)
  pool
};

module.exports = db;
