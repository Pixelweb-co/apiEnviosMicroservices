const mongoose = require('mongoose'); 
const solicitudSchema = new mongoose.Schema({ 
  driver: { type: Object, required: true }, 
  vehiculo: { type: Object, required: true }, 
  user_id: { type: String, required: true } ,
  fecha:{ type: Date, required: true } ,
  fecha_aprobacion:{ type: Date, required: true } ,
  estado:{ type: String, required: true }
}); 
const Solicitudes_c = mongoose.model('solicitudes_contratistas', solicitudSchema); 
module.exports = Solicitudes_c; 
