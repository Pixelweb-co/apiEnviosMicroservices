const express = require('express'); 
const mongoose = require('mongoose'); 
const bodyParser = require('body-parser'); 
const ratingRoutes = require('./routes/ratingRoutes'); 
const app = express(); 
app.use(bodyParser.json()); 
app.use('/rating', ratingRoutes); 
mongoose.connect('mongodb://db_calificaciones:27017/ratings', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}) 
  .then(() =>{
    console.log('Servidor db en db_calificaciones:27017'); 
  })
  .catch(err =>console.log("error al conectar a la base de datos", err)); 

  
// Iniciar la aplicación
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor en línea en el puerto ${PORT}`);
});
