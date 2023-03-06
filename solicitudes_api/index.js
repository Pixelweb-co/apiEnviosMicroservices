const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const RabbitMQConnection = require('./services/rabbitMq');
//const SolicitudContorller = require('./controllers/solicitudController')
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


const send_rabbit_requisitions = async (connection)=>{

  try {
    // Conectarse a RabbitMQ

    const connection = await RabbitMQConnection.connect();

    const channel = await connection.createChannel();
    const queueName = 'solicitudes';
  

      await channel.assertQueue(queueName, { durable: true });
      console.log(`La cola ${queueName} se ha creado correctamente`);
    
    // Enviar solicitudes a RabbitMQ
    // solicitudes.forEach((solicitud) => {
    //   channel.sendToQueue(queueName, Buffer.from(JSON.stringify(solicitud)));
    // });
  
    //console.log(`Se han enviado ${solicitudes.length} solicitudes pendientes a la cola "${queueName}"`);

    console.log('Esperando solicitudes en el servicio...');

    channel.consume(queueName, async (message) => {
    const solicitudFrom = JSON.parse(message.content.toString());

    console.log(`Solicitud recibida desde el socker: ${JSON.stringify(solicitudFrom)}`);

    // Procesar la solicitud aquí
    if(solicitudFrom.cmd=='NEW'){

      var pendingSolicitud = solicitudFrom.solicitud

      pendingSolicitud.status="PENDING"

      const solicitud = new Solicitud(pendingSolicitud);

      var newSolicitud = await solicitud.save();

      channel.ack(message); // Eliminar la solicitud de la cola
      console.log(`Solicitud creada en servicio : ${JSON.stringify(newSolicitud)}`);
      
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify({service:"solicitud",cmd:"SAVED",solicitud:newSolicitud})));
    }

  })
  
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
