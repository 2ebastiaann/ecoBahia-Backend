// controlador/recorridos_locales.controlador.js

const RecorridoRepository = require('../repositories/recorrido.repository');
const { iniciarRecorrido } = require('../services/apiRecoleccion/recorridos.service');

async function listarRecorridos(req, res) {
  try {
    const recorridos = await RecorridoRepository.findAll();
    res.json(recorridos);
  } catch (error) {
    console.error('❌ ERROR GET recorridos:', error);
    res.status(500).json({ mensaje: 'Error al consultar recorridos', detalle: error.message });
  }
}

async function crearRecorrido(req, res) {
  const { ruta_id, vehiculo_id, perfil_id } = req.body;
  
  if (!ruta_id || !vehiculo_id || !perfil_id) {
    return res.status(400).json({ mensaje: 'ruta_id, vehiculo_id y perfil_id son obligatorios' });
  }

  try {
    // 1. Validar que no existan en otro recorrido activo
    const recorridosActivos = await RecorridoRepository.findActivosConflicto(ruta_id, vehiculo_id, perfil_id);

    if (recorridosActivos && recorridosActivos.length > 0) {
      return res.status(400).json({ 
        mensaje: 'Uno de los elementos (Conductor, Vehículo o Ruta) ya está ocupado en un recorrido activo.'
      });
    }

    // 2. Guardar en BD local
    const nuevo = await RecorridoRepository.create({ ruta_id, vehiculo_id, perfil_id, activo: true });
    console.log('✅ Recorrido guardado en BD:', nuevo.id);

    // 3. Enviar a la API Externa
    //    ⚠️ La API del profesor NO tiene registro de conductores, así que
    //    usamos nuestro PERFIL_ID fijo del .env como identidad ante la API.
    //    En la BD local se guarda el perfil_id real del conductor.
    try {
      const responseApi = await iniciarRecorrido({
        ruta_id,
        vehiculo_id,
        perfil_id: process.env.PERFIL_ID
      });
      console.log('✅ Recorrido iniciado en API externa. Respuesta:', JSON.stringify(responseApi));
      
      // Intentar extraer el UUID que devuelve el profesor
      const id_externo = responseApi.id || responseApi.data?.id || responseApi.recorrido?.id || null;
      
      if (id_externo) {
        try {
          await RecorridoRepository.updateExterno(nuevo.id, id_externo);
          console.log(`✅ Guardado id_externo (${id_externo}) para el recorrido local ${nuevo.id}`);
        } catch (dbError) {
          console.error(`❌ ERROR al guardar id_externo en BD. ¿Existe la columna 'id_externo' en la tabla 'recorridos'?`, dbError.message);
        }
      } else {
        console.warn('⚠️ No se pudo extraer id de la respuesta API. Keys:', Object.keys(responseApi));
      }
    } catch (apiError) {
      console.error('⚠️ La API externa devolvió un error:', apiError.message);
    }

    res.status(201).json(nuevo);
  } catch (error) {
    console.error('❌ ERROR POST recorridos:', error);
    res.status(500).json({ mensaje: 'Error al crear recorrido', detalle: error.message });
  }
}

async function desactivarRecorrido(req, res) {
  const { id } = req.params;

  try {
    const recorridoActual = await RecorridoRepository.findById(id);

    if (!recorridoActual) return res.status(404).json({ mensaje: 'Recorrido no encontrado' });
    if (!recorridoActual.activo) return res.status(400).json({ mensaje: 'El recorrido ya está finalizado' });

    // Desactivar
    const desactivado = await RecorridoRepository.desactivar(id);
    res.json({ mensaje: 'Recorrido finalizado', recorrido: desactivado });
  } catch (error) {
    console.error('❌ ERROR PUT desactivar recorrido:', error);
    res.status(500).json({ mensaje: 'Error al finalizar', detalle: error.message });
  }
}

async function activarRecorrido(req, res) {
  const { id } = req.params;

  try {
    const recorridoActual = await RecorridoRepository.findById(id);

    if (!recorridoActual) return res.status(404).json({ mensaje: 'Recorrido no encontrado' });
    if (recorridoActual.activo) return res.status(400).json({ mensaje: 'El recorrido ya está activo' });

    // Activar
    const activado = await RecorridoRepository.activar(id);
    res.json({ mensaje: 'Recorrido activado', recorrido: activado });
  } catch (error) {
    console.error('❌ ERROR PUT activar recorrido:', error);
    res.status(500).json({ mensaje: 'Error al activar', detalle: error.message });
  }
}

async function listarRecorridosPorConductor(req, res) {
  const { conductorId } = req.params;
  try {
    const recorridos = await RecorridoRepository.findByConductor(conductorId);
    res.json(recorridos);
  } catch (error) {
    console.error('❌ ERROR GET recorridos por conductor:', error);
    res.status(500).json({ mensaje: 'Error al consultar recorridos del conductor', detalle: error.message });
  }
}

module.exports = { listarRecorridos, crearRecorrido, desactivarRecorrido, activarRecorrido, listarRecorridosPorConductor };
