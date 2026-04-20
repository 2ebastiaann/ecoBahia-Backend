const supabase = require('../config/supabase');

(async () => {
  const { data, error } = await supabase.from('usuarios').select('*').limit(1);

  if (error) {
    console.error("❌ Error Supabase:", error);
  } else {
    console.log("🟢 CONEXIÓN OK", data);
  }
})();
