const { sequelize } = require('../config/db.config');

const Usuario = require('./usuarios.maqueta');
const Rol = require('./rol.maqueta');
const PerfilUsuario = require('./perfil_usuario.maqueta');
const Horario = require('./horario.maqueta');
const RutaBarrio = require('./ruta.barrio.maqueta');
const Posicion = require('./posicion.maqueta');
const Barrio = require('./barrio.maqueta');

// RELACIONES (usar nombres de columna EXACTOS de la BD)

// Rol (1) <--> (N) Usuario  via usuarios.id_rol
Rol.hasMany(Usuario, {
  foreignKey: 'id_rol',
  as: 'usuarios'
});
Usuario.belongsTo(Rol, {
  foreignKey: 'id_rol',
  as: 'rol'
});

// Usuario (1) <--> (1) PerfilUsuario via perfil_usuario.id_usuario
Usuario.hasOne(PerfilUsuario, {
  foreignKey: 'id_usuario',
  as: 'perfil'
});
PerfilUsuario.belongsTo(Usuario, {
  foreignKey: 'id_usuario',
  as: 'usuario'
});

// Exportar
module.exports = {
  sequelize,
  Usuario,
  Rol,
  PerfilUsuario,
  Horario,
  RutaBarrio,
  Posicion,
  Barrio
};
