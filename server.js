require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3007;

// ===============================
// 🚀 INICIAR BACKEND CON SUPABASE
// ===============================
(async () => {
    try {
        console.log('🚀 Iniciando backend con Supabase...');

        // ATENCIÓN: 0.0.0.0 permite recibir tráfico externo
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🟢 Servidor corriendo en http://0.0.0.0:${PORT}`);
            console.log(`🌐 API lista externamente en :${PORT}`);
        });

    } catch (err) {
        console.error('❌ Error crítico al iniciar backend:', err);
        process.exit(1);
    }
})();
