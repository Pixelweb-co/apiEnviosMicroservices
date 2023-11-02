const express = require('express'); 
const mongoose = require('mongoose'); 
const bodyParser = require('body-parser'); 
const contratistaRoutes = require('./routes/contratistaRoutes'); 
const cors = require('cors');

const app = express(); 

app.use(cors());
// Configurar la aplicación
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Configurar CORS



app.use("/contratistas",contratistaRoutes);


mongoose.connect('mongodb://db_contratistas:27017/contratistas', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}) 
  .then(() =>{
    console.log('Servidor en ejecución en http://db_contratistas:3000'); 
  })
  .catch(err =>console.log("error al conectar a la base de datos", err)); 


  // Iniciar la aplicación
const PORT = 3011;
app.listen(PORT, () => {
  console.log(`Servidor en línea en el puerto ${PORT}`);
});
