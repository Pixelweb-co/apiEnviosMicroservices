const mongoose = require('mongoose');

var Oferta = mongoose.model("Oferta", {
  valor: Number,
  contratista: String,
  contratista_name: String,
  contratante: String,
  cliente: String,
  estado: String,
  solicitud: String,
  fecha:Date
});



module.exports = Oferta;