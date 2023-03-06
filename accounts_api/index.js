const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqp');
const authRoutes = require('./routes/auth.routes');

const app = express();

const send_rabbit_requisitions = async ()=>{

  try {
    // Conectarse a RabbitMQ
    const connection = await amqp.connect('amqp://admin:admin@rabbitmq:5672');
    const channel = await connection.createChannel();
    const queueName = 'accounts';
  
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify({cmd:"service accounts initialited."})));
  
    console.log(`Se han enviado rabbitmq "${queueName}"`);
  
  } catch (error) {
    console.error(error);
  }

}


// Conectar a la base de datos
mongoose.connect('mongodb://'+process.env.DB_HOST+':27017/accounts', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión exitosa a la base de datos');
}).catch((err) => {
  console.error('Error al conectar a la base de datos', err);
});



// Configurar la aplicación
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Configurar las rutas
app.use('/accounts', authRoutes);

// Iniciar la aplicación
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor en línea en el puerto ${PORT}`);
});
