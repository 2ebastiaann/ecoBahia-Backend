// config/database.js
// ============================================================
// DATABASE ADAPTER - Capa de abstracción de base de datos
// ============================================================
// HOY:    usa Supabase internamente
// FUTURO: se reemplaza SOLO este archivo por pg Pool (PostgreSQL)
//
// REGLA: ningún archivo fuera de config/ debe saber qué BD se usa.
//        Controllers y repositories SOLO llaman métodos genéricos.
// ============================================================

const supabase = require('./supabase');

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
    let query = supabase.from(table).select(columns);
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    if (order) {
      query = query.order(order.column, { ascending: order.ascending });
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
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
    let query = supabase.from(table).select(columns);

    // Aplica filtros AND
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    // Aplica condiciones OR
    if (orConditions.length > 0) {
      const orString = orConditions
        .map(cond => `${cond.column}.eq.${cond.value}`)
        .join(',');
      query = query.or(orString);
    }

    if (order) {
      query = query.order(order.column, { ascending: order.ascending });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // ==========================================================
  // FIND ONE — SELECT un solo registro
  // ==========================================================
  // @returns {Promise<object|null>}
  async findOne(table, { columns = '*', filters = {}, order = null } = {}) {
    let query = supabase.from(table).select(columns);
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    if (order) {
      query = query.order(order.column, { ascending: order.ascending });
    }
    const { data, error } = await query.limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },

  // ==========================================================
  // INSERT — Insertar y retornar el registro creado
  // ==========================================================
  // @returns {Promise<object>}
  async insert(table, record) {
    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ==========================================================
  // INSERT NO RETURN — Insertar sin retornar (espejos, logs)
  // ==========================================================
  async insertNoReturn(table, record) {
    const { error } = await supabase.from(table).insert(record);
    if (error) throw error;
  },

  // ==========================================================
  // UPDATE — Actualizar registros por filtros
  // ==========================================================
  // @param {object} filters - { columna: valor } para WHERE
  // @param {object} updates - Campos a actualizar
  // @returns {Promise<object>}
  async update(table, filters, updates) {
    let query = supabase.from(table).update(updates);
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  },

  // ==========================================================
  // REMOVE — Eliminar registros por filtros
  // ==========================================================
  async remove(table, filters) {
    let query = supabase.from(table).delete();
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    const { error } = await query;
    if (error) throw error;
  }
};

module.exports = db;
