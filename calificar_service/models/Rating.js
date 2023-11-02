const mongoose = require('mongoose'); 
const ratingSchema = new mongoose.Schema({ 
  solicitud: { type: String, required: true }, 
  tipo: { type: String, required: true }, 
  user: { type: String, required: true }, 
  calificacion: { type: Number, required: true } 
}); 
const Rating = mongoose.model('Rating', ratingSchema); 
module.exports = Rating; 
