// controlador/recorridos_locales.controlador.js
const supabase = require('../config/supabase');

async function listarRecorridos(req, res) {
  try {
    const { data: recorridos, error } = await supabase
      .from('recorridos')
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) throw error;
    res.json(recorridos || []);
  } catch (error) {
    console.error('❌ ERROR GET recorridos (Supabase):', error);
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
    const { data: recorridosActivos, error: errorBusqueda } = await supabase
      .from('recorridos')
      .select('ruta_id, vehiculo_id, perfil_id')
      .eq('activo', true)
      .or(`ruta_id.eq.${ruta_id},vehiculo_id.eq.${vehiculo_id},perfil_id.eq.${perfil_id}`);

    if (errorBusqueda) throw errorBusqueda;

    if (recorridosActivos && recorridosActivos.length > 0) {
      return res.status(400).json({ 
        mensaje: 'Uno de los elementos (Conductor, Vehículo o Ruta) ya está ocupado en un recorrido activo.'
      });
    }

    // 2. Guardar en Supabase localmente
    const { data: nuevo, error } = await supabase
      .from('recorridos')
      .insert({
        ruta_id,
        vehiculo_id,
        perfil_id,
        activo: true // Lo ponemos activo de inmediato ya que se inicia en la API
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Recorrido guardado en Supabase:', nuevo.id);

    // 3. Enviar a la API Externa
    const externaBaseUrl = process.env.API_VEHICULOS_URL ? process.env.API_VEHICULOS_URL.replace('/vehiculos', '') : 'https://apirecoleccion.gonzaloandreslucio.com/api';
    const apiUrl = `${externaBaseUrl}/recorridos/iniciar`;
    
    console.log('🚀 Enviando a API externa:', apiUrl);
    
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ruta_id,
        vehiculo_id,
        perfil_id
      })
    });

    if (!apiResponse.ok) {
      const apiErrorText = await apiResponse.text();
      console.error('⚠️ La API externa devolvió un error:', apiResponse.status, apiErrorText);
    } else {
      console.log('✅ Recorrido iniciado exitosamente en la API externa');
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
    const { data: recorridoActual, error: errorSelect } = await supabase
      .from('recorridos')
      .select('id, activo')
      .eq('id', id)
      .single();

    if (errorSelect) throw errorSelect;
    if (!recorridoActual) return res.status(404).json({ mensaje: 'Recorrido no encontrado' });
    if (!recorridoActual.activo) return res.status(400).json({ mensaje: 'El recorrido ya está finalizado' });

    // Desactivar
    const { data: desactivado, error: errorUpdate } = await supabase
      .from('recorridos')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single();

    if (errorUpdate) throw errorUpdate;
    res.json({ mensaje: 'Recorrido finalizado', recorrido: desactivado });
  } catch (error) {
    console.error('❌ ERROR PUT desactivar recorrido:', error);
    res.status(500).json({ mensaje: 'Error al finalizar', detalle: error.message });
  }
}

async function listarRecorridosPorConductor(req, res) {
  const { conductorId } = req.params;
  try {
    const { data: recorridos, error } = await supabase
      .from('recorridos')
      .select('*')
      .eq('perfil_id', conductorId)
      .order('creado_en', { ascending: false });

    if (error) throw error;
    res.json(recorridos || []);
  } catch (error) {
    console.error('❌ ERROR GET recorridos por conductor:', error);
    res.status(500).json({ mensaje: 'Error al consultar recorridos del conductor', detalle: error.message });
  }
}

module.exports = { listarRecorridos, crearRecorrido, desactivarRecorrido, listarRecorridosPorConductor };

