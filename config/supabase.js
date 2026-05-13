// config/supabase.js
// ============================================================
// Cliente Supabase — adaptador temporal hasta migración a PostgreSQL
// NOTA: Este archivo será reemplazado por el driver pg/Sequelize
//       en la migración. No agregar lógica de negocio aquí.
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
