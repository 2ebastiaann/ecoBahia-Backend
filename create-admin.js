require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/database');

(async () => {
  try {
    console.log('Generando hash para la contraseña...');
    const saltRounds = 10;
    const passwordPlain = '12345A!';
    const passwordHash = await bcrypt.hash(passwordPlain, saltRounds);

    console.log('Insertando usuario administrador en la base de datos...');
    const nuevoAdmin = await db.insert('usuarios', {
      email: 'administrador@correo.com',
      password_hash: passwordHash,
      id_rol: 1, // 1 es administrador
      nombre: 'Admin',
      apellido: 'Principal'
    });

    console.log('\n✅ Usuario creado exitosamente:');
    console.log(`- Email: ${nuevoAdmin.email}`);
    console.log(`- Contraseña: ${passwordPlain}`);
    console.log(`- Rol ID: ${nuevoAdmin.id_rol}`);
    console.log('\nYa puedes iniciar sesión en la plataforma web.');
    
  } catch (error) {
    if (error.code === '23505' || error.message.includes('unique constraint')) {
      console.log('\n⚠️ El usuario ya existe en la base de datos.');
      console.log('Credenciales:');
      console.log('- Email: administrador@correo.com');
      console.log('- Contraseña: 12345A!');
    } else {
      console.error('\n❌ Error creando el usuario:', error);
    }
  } finally {
    process.exit(0);
  }
})();
