const axios = require('axios');

const API_URL = process.env.API_VEHICULOS_URL;
const PERFIL_ID = process.env.PERFIL_ID;

exports.obtenerVehiculos = async (req, res) => {

  console.log("API_URL:", API_URL);
  console.log("PERFIL_ID:", PERFIL_ID);
  console.log("⚙ vehiculos.service.js cargado");


  try {
    const response = await axios.get(API_URL, "/?perfil_id=" + PERFIL_ID, {
     
    });

    return res.json({
      msg: "OK",
      data: response.data
    });

  } catch (error) {
    console.error("Error al obtener vehículos:", error);

    return res.status(500).json({
      msg: "ERROR",
      error: error.message
    });
  }
};
