const mongoose = require('mongoose'); 
const vehiculoSchema = new mongoose.Schema({ 
  user: { type: String, required: true }, 
  placa: { type: String, required: true }, 
  modelo: { type: String, required: true } ,
  tipo:{ type: String, required: true } ,
  estado:{ type: String, required: true },
  color:{ type: String, required: true },
  tecnico_mecanica_vence:{ type: String, required: true },
  soat_vence:{ type: String, required: true }
}); 
const Vehiculo = mongoose.model('vehiculos', vehiculoSchema); 
module.exports = Vehiculo; 
