const mongoose = require('mongoose');

var solicitudM = mongoose.Schema({
  id: Number,
  id_client: String,
  client_data: Object,
  id_driver: String,
  status: String,
  comments: Object,
  destinations: Array,
  tarifa: Object,
  type: String,
  origin: Object,
  fecha: Date,
  ratedClient:String,
  ratedDriver:String
});


var Solicitud = mongoose.model("Solicitude", solicitudM);


module.exports = Solicitud;
