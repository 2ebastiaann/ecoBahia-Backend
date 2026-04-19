const { Recorrido } = require('../maquetas');
const { Op } = require('sequelize');
const { obtenerVehiculoPorId } = require('../services/apiRecoleccion');

async function listarRecorridos(req, res) {
  try {
    const recorridos = await Recorrido.findAll({
      order: [['creado_en', 'DESC']]
    });

    // Enriquecer cada recorrido con la placa del vehículo
    const recorridosEnriquecidos = await Promise.all(
      recorridos.map(async (r) => {
        const plain = r.toJSON();
        try {
          const vehiculo = await obtenerVehiculoPorId(plain.vehiculo_id);
          // La API puede devolver { data: { placa, marca, ... } } o directamente { placa, marca, ... }
          const v = vehiculo.data || vehiculo;
          plain.vehiculo_placa = v.placa || 'Sin placa';
          plain.vehiculo_marca = v.marca || '';
        } catch (e) {
          plain.vehiculo_placa = 'No disponible';
          plain.vehiculo_marca = '';
        }
        return plain;
      })
    );

    res.json(recorridosEnriquecidos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar recorridos', detalle: error.message });
  }
}

async function crearRecorrido(req, res) {
  const { ruta_id, vehiculo_id, perfil_id } = req.body;
  if (!ruta_id || !vehiculo_id || !perfil_id) {
    return res.status(400).json({ mensaje: 'ruta_id, vehiculo_id y perfil_id son obligatorios' });
  }

  try {
    // Verificar si el conductor, vehículo o ruta ya están en algún recorrido
    const existente = await Recorrido.findOne({
      where: {
        [Op.or]: [
          { ruta_id },
          { vehiculo_id },
          { perfil_id }
        ]
      }
    });

    if (existente) {
      if (existente.ruta_id === ruta_id) return res.status(400).json({ mensaje: 'La ruta ya está asignada a un recorrido.' });
      if (existente.vehiculo_id === vehiculo_id) return res.status(400).json({ mensaje: 'El vehículo ya está asignado a un recorrido.' });
      if (existente.perfil_id === perfil_id) return res.status(400).json({ mensaje: 'El conductor ya está asignado a un recorrido.' });
    }

    const nuevo = await Recorrido.create({
      ruta_id,
      vehiculo_id,
      perfil_id,
      activo: false
    });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear recorrido', detalle: error.message });
  }
}

async function desactivarRecorrido(req, res) {
  const { id } = req.params;
  try {
    const recorrido = await Recorrido.findByPk(id);
    if (!recorrido) return res.status(404).json({ mensaje: 'Recorrido no encontrado' });
    if (!recorrido.activo) return res.status(400).json({ mensaje: 'El recorrido ya está inactivo' });

    recorrido.activo = false;
    await recorrido.save();

    res.json({ mensaje: 'Recorrido desactivado con éxito', recorrido });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al desactivar recorrido', detalle: error.message });
  }
}

module.exports = { listarRecorridos, crearRecorrido, desactivarRecorrido };
