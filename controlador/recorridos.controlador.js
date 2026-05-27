// controlador/recorridos.controlador.js
const { iniciarRecorrido, finalizarRecorrido } = require('../services/apiRecoleccion/recorridos.service');
const RecorridoRepository = require('../repositories/recorrido.repository');

// GET: Listar todos los recorridos
async function listarRecorridos(req, res) {
  try {
    const recorridos = await RecorridoRepository.findAll();
    res.json(recorridos);
  } catch (error) {
    console.error('❌ ERROR GET recorridos:', error);
    res.status(500).json({ mensaje: 'Error al consultar recorridos', detalle: error.message });
  }
}

// GET: Listar por conductor
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

// POST: Iniciar recorrido
async function registrarInicioRecorrido(req, res) {
  const { ruta_id, vehiculo_id, perfil_id } = req.body;
  
  if (!ruta_id || !vehiculo_id || !perfil_id) {
    return res.status(400).json({ mensaje: 'ruta_id, vehiculo_id y perfil_id son obligatorios' });
  }

  try {
    // 1. Validar conflictos localmente
    const recorridosActivos = await RecorridoRepository.findActivosConflicto(ruta_id, vehiculo_id, perfil_id);
    if (recorridosActivos && recorridosActivos.length > 0) {
      return res.status(400).json({ mensaje: 'Uno de los elementos (Conductor, Vehículo o Ruta) ya está ocupado en un recorrido activo.' });
    }

    // 2. Guardar en BD local (Inactivo por defecto)
    const nuevo = await RecorridoRepository.create({ ruta_id, vehiculo_id, perfil_id, activo: false });
    console.log('✅ Recorrido asignado en BD local (inactivo):', nuevo.id);

    res.status(201).json(nuevo);
  } catch (error) {
    console.error('❌ ERROR POST iniciar recorrido:', error);
    res.status(500).json({ mensaje: 'Error al crear recorrido', detalle: error.message });
  }
}

// POST: Finalizar recorrido
async function registrarFinalizacionRecorrido(req, res) {
  try {
    const { id } = req.params;
    let recorridoFinalizadoApi = null;

    const recorridoActual = await RecorridoRepository.findById(id);

    if (recorridoActual) {
      if (recorridoActual.activo) {
        await RecorridoRepository.desactivar(id);
        console.log(`✅ Recorrido local ${id} finalizado (activo = false).`);
      }

      const id_externo = await RecorridoRepository.findIdExterno(id);
      
      const payloadProfe = {
        ...(req.body || {}),
        perfil_id: process.env.PERFIL_ID,
        fecha_fin: new Date().toISOString()
      };

      console.log('📦 Payload a enviar a API externa:', payloadProfe);

      if (id_externo) {
        try {
          recorridoFinalizadoApi = await finalizarRecorrido(id_externo, payloadProfe);
          console.log(`✅ Recorrido finalizado en API externa (${id_externo}).`);
        } catch (apiError) {
          console.error(`⚠️ Error al finalizar en API externa: ${apiError.message}`);
        }
      }
    } else {
      try {
        const payloadProfe = {
          ...(req.body || {}),
          perfil_id: process.env.PERFIL_ID,
          fecha_fin: new Date().toISOString()
        };
        console.log('📦 Payload a enviar a API externa (directo):', payloadProfe);
        recorridoFinalizadoApi = await finalizarRecorrido(id, payloadProfe);
        console.log(`✅ Recorrido finalizado directo en API externa (${id}).`);
      } catch (apiError) {
         return res.status(404).json({ mensaje: 'Recorrido no encontrado ni local ni remotamente', detalle: apiError.message });
      }
    }

    res.json({
      mensaje: 'Recorrido finalizado exitosamente',
      api_response: recorridoFinalizadoApi || { status: 'Finalizado solo localmente' }
    });
  } catch (error) {
    console.error('❌ Error general al finalizar recorrido:', error);
    res.status(500).json({ mensaje: 'Error al finalizar recorrido', detalle: error.message });
  }
}

// POST: Activar recorrido
async function activarRecorrido(req, res) {
  const { id } = req.params;
  try {
    const recorridoActual = await RecorridoRepository.findById(id);
    if (!recorridoActual) return res.status(404).json({ mensaje: 'Recorrido no encontrado' });
    if (recorridoActual.activo) return res.status(400).json({ mensaje: 'El recorrido ya está activo' });

    // 1. Activar localmente (guardando la fecha de inicio de la sesión actual)
    const activado = await RecorridoRepository.activar(id);
    console.log(`✅ Recorrido ${id} activado localmente.`);

    // 2. Notificar a la API externa (El profesor)
    try {
      const responseApi = await iniciarRecorrido({
        ruta_id: recorridoActual.ruta_id,
        vehiculo_id: recorridoActual.vehiculo_id,
        perfil_id: process.env.PERFIL_ID
      });
      console.log('✅ Recorrido iniciado en API externa.');
      
      const id_externo = responseApi.id || responseApi.data?.id || responseApi.recorrido?.id || null;
      if (id_externo) {
        await RecorridoRepository.updateExterno(id, id_externo);
        console.log(`✅ Guardado id_externo (${id_externo}) para el recorrido local ${id}`);
      }
    } catch (apiError) {
      console.error('⚠️ La API externa devolvió un error al activar:', apiError.message);
    }

    res.json({ mensaje: 'Recorrido activado y sincronizado', recorrido: activado });
  } catch (error) {
    console.error('❌ ERROR PUT activar recorrido:', error);
    res.status(500).json({ mensaje: 'Error al activar', detalle: error.message });
  }
}

module.exports = { 
  listarRecorridos, 
  listarRecorridosPorConductor, 
  registrarInicioRecorrido, 
  registrarFinalizacionRecorrido, 
  activarRecorrido 
};