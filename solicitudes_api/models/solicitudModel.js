const mongoose = require('mongoose');


var Solicitud = mongoose.model("Solicitude", {
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

module.exports = Solicitud;