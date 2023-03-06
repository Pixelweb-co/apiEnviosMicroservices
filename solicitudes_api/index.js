const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const Solicitud = require('./models/solicitudModel')



const solicitudesRoutes = require('./routes/solicitudes.routes');

const app = express();

//Conectar a la base de datos
mongoose.connect('mongodb://'+process.env.DB_HOST+':27017/solicitudes_api', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conexión exitosa a la base de datos');
}).catch((err) => {
  console.error('Error al conectar a la base de datos', err);
});


const send_rabbit_requisitions = async ()=>{

  try {
    // Conectarse a RabbitMQ
    const connection = await amqp.connect('amqp://admin:admin@rabbitmq:5672');
    const channel = await connection.createChannel();
    const queueName = 'solicitudes';
  

      await channel.assertQueue(queueName, { durable: true });
      console.log(`La cola ${queueName} se ha creado correctamente`);
    
    // Cargar solicitudes pendientes de MongoDB

    const solicitudes = await Solicitud.find({status:"PENDING"});
  
    // Enviar solicitudes a RabbitMQ
    solicitudes.forEach((solicitud) => {
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(solicitud)));
    });
  
    console.log(`Se han enviado ${solicitudes.length} solicitudes pendientes a la cola "${queueName}"`);
  
  } catch (error) {
    console.error(error);
  }

}


//enviar solicitudes pendientes a estado de cola
send_rabbit_requisitions()



// Configurar la aplicación
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



// Configurar las rutas
app.use('/solicitudes', solicitudesRoutes);

// Iniciar la aplicación
const PORT = 3000;


app.listen(PORT, () => {
  console.log(`Servidor en línea en el puerto ${PORT}`);
});
