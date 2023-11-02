const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const authRoutes = require('./routes/auth.routes');
const path = require("path");
const cors = require('cors');
const app = express();

// Conectar a la base de datos
mongoose.connect('mongodb://'+process.env.DB_HOST+':27017/accounts', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión exitosa a la base de datos');
}).catch((err) => {
  console.error('Error al conectar a la base de datos', err);
});


const send_rabbit_accounts = async ()=>{

  try {
    // Conectarse a RabbitMQ
    const connection = await amqp.connect('amqp://admin:admin@rabbitmq:5672');
    const channel = await connection.createChannel();
    const queueName = 'accounts';
  

      await channel.assertQueue(queueName, { durable: true });
      console.log(`La cola ${queueName} se ha creado correctamente`);

  } catch (error) {
    console.error(error);
  }

}


//enviar cola
send_rabbit_accounts()


// Configurar la aplicación
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());
// Ruta para servir archivos estáticos
app.use("/public", express.static(path.join(__dirname, "public")));

// Ruta para manejar solicitudes de imágenes
app.get("/accounts/foto/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, "public", imageName);
  res.sendFile(imagePath);
});

// Configurar las rutas
app.use('/accounts', authRoutes);

// Iniciar la aplicación
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor en línea en el puerto ${PORT}`);
});
