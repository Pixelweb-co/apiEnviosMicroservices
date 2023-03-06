const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require("cors");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
const RabbitMQConnection = require('./services/rabbitMq');

const QUEUE_NAME_SOLICITUDES = 'solicitudes'

const app = express();

const server = http.createServer(app);

let socketInstance =  null

let connection = null
let channel = null

const send_rabbit_socket = async ()=>{

  try {
    // Conectarse a RabbitMQ
    connection = await RabbitMQConnection.connect();
    channel = await connection.createChannel();
    const queueName = 'socket';
  

      await channel.assertQueue(queueName, { durable: true });
      console.log(`La cola ${queueName} se ha creado correctamente`);



      console.log('Esperando respuesta de solicitudes...');

      channel.consume(QUEUE_NAME_SOLICITUDES, (message) => {
        const solicitud = JSON.parse(message.content.toString());
    
        console.log(`Solicitud recibida desde servicio como respuesta al guardar : ${JSON.stringify(solicitud)}`);
    
        // Procesar la solicitud aquí
        
        socketInstance.emit('solicitudProcesada', solicitud);
        channel.ack(message); // Eliminar la solicitud de la cola
    
      }, { noAck: false });


    } catch (error) {
    console.error(error);
  }

}




const io = socketIO(server, { cors: {
  origin: "*",
  methods: ["GET", "POST"]
}});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors()); // Permitir solicitudes CORS desde cualquier origen 

app.get("/",(req,res)=>{

  return res.status(200).json({result:"welcome to socket service"})


})


// Manejar conexiones Socket.io en la ruta `/socket`
io.of('/socket').on('connection', (socket) => {
  console.log(`Nuevo cliente conectado: ${socket.id}`);
  socketInstance = socket
  // Manejar eventos enviados desde el cliente
  socket.on('mensajeDesdeCliente', (data) => {
    console.log(`Mensaje desde cliente recibido: ${JSON.stringify(data)}`);

    // Enviar un mensaje al cliente
    socket.emit('mensajeDesdeServidor', { mensaje: 'Hola, cliente!' });
  });


  //nueva solicitud
  socket.on("nueva_solicitud",async (data,socketID)=>{

  const QUEUE_NAME = 'solicitudes';  
  const solicitud = data;

  if(channel){
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(solicitud)));

  console.log(`>>>>>>>>>> Sent solicitud hacia cola servicio: ${JSON.stringify(solicitud)}`);
  }

  })

  // Manejar desconexiones del cliente
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});





//enviar cola
send_rabbit_socket()

server.listen(3004, () => {
  console.log('Servidor Socket.io escuchando en el puerto 3004');
});

