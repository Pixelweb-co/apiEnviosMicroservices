const mongoose = require('mongoose');


var Usuariosh = mongoose.Schema({
    nombres: String,
    apellidos: String,
    usuario: String,
    password: String,
    email: String,
    telefono: String,
    direccion: String,
    ciudad: String,
    estado: String,
    saldo: Number,
    placa_vehiculo: String,
    modelo_vehiculo: String,
    cedula: Number,
    marca_vehiculo: String,
    tipo: String,
    act_code: String,
    avatar: String,
  });


var usuario = mongoose.model("users", Usuariosh);
  

module.exports = usuario;
