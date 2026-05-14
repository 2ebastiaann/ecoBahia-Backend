const db = require('./config/database');

(async () => {
  try {
    const result = await db.query(
      "INSERT INTO reportes (nombre, email, reporte) VALUES ($1, $2, $3) RETURNING *",
      ['test', 'test@test.com', 'prueba de reporte']
    );
    console.log('TIPO:', typeof result);
    console.log('ES ARRAY:', Array.isArray(result));
    console.log('RESULTADO:', JSON.stringify(result, null, 2));
  } catch(e) {
    console.error('ERROR:', e.message);
  }
  process.exit(0);
})();
