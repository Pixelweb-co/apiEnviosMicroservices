const express = require('express');
const mongoose = require('mongoose');
//const authRoutes = require('./routes/auth.routes');

const app = express();

// Conectar a la base de datos
// mongoose.connect('mongodb://'+process.env.DB_HOST+':27017/envios', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   console.log('Conexión exitosa a la base de datos');
// }).catch((err) => {
//   console.error('Error al conectar a la base de datos', err);
// });


// Configurar la aplicación
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/solicitudes',(req,res)=>{

    res.json({result:"Welcome to solicitudes Api"})

})
// Configurar las rutas
//app.use('/accounts/auth', authRoutes);

// Iniciar la aplicación
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor en línea en el puerto ${PORT}`);
});
