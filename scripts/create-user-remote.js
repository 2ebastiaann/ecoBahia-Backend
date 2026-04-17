// scripts/create-user-remote.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const ssh2 = require('ssh2');
const net = require('net');

const SSH_HOST = process.env.SSH_HOST;
const SSH_PORT = parseInt(process.env.SSH_PORT);
const SSH_USER = process.env.SSH_USER;
const SSH_PASSWORD = process.env.SSH_PASSWORD;

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_HOST = '127.0.0.1'; // túnel
const DB_PORT = 5433;        // puerto local del túnel

const LOCAL_PORT = DB_PORT;

const NEW_USER_EMAIL = 'sebastian@test.com';
const NEW_USER_PASSWORD = '123456';
const DEFAULT_ROLE = 2;

const sshClient = new ssh2.Client();

sshClient.on('ready', () => {
    console.log('✅ Conexión SSH establecida');

    const server = net.createServer((socket) => {
        sshClient.forwardOut(
            '127.0.0.1',
            LOCAL_PORT,
            '127.0.0.1',
            5432, // puerto del PostgreSQL remoto
            (err, stream) => {
                if (err) throw err;
                socket.pipe(stream).pipe(socket);
            }
        );
    });

    server.listen(LOCAL_PORT, '127.0.0.1', async () => {
        console.log(`🔗 Puente local abierto en ${DB_HOST}:${LOCAL_PORT}`);

        const client = new Client({
            host: DB_HOST,
            port: LOCAL_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME,
        });

        try {
            await client.connect();
            console.log('✅ Conectado a la BD remota');

            const hashed = await bcrypt.hash(NEW_USER_PASSWORD, 10);

            // Inserta usuario (cambia el nombre de tabla y columnas si es necesario)
            const query = `
                INSERT INTO usuarios (email, password_hash, id_rol)
                VALUES ($1, $2, $3)
                ON CONFLICT (email) DO NOTHING
            `;
            await client.query(query, [NEW_USER_EMAIL, hashed, DEFAULT_ROLE]);

            console.log(`✅ Usuario '${NEW_USER_EMAIL}' creado / existe en la BD`);

            await client.end();
            sshClient.end();
            server.close();
        } catch (err) {
            console.error('❌ Error creando usuario:', err);
            sshClient.end();
            server.close();
        }
    });
}).connect({
    host: SSH_HOST,
    port: SSH_PORT,
    username: SSH_USER,
    password: SSH_PASSWORD,
});
