const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require("cors");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
const amqp = require('amqplib');



const app = express();

const server = http.createServer(app);


const send_rabbit_socket = async ()=>{

  try {
    // Conectarse a RabbitMQ
    const connection = await amqp.connect('amqp://admin:admin@rabbitmq:5672');
    const channel = await connection.createChannel();
    const queueName = 'socket';
  

      await channel.assertQueue(queueName, { durable: true });
      console.log(`La cola ${queueName} se ha creado correctamente`);

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

  // Manejar eventos enviados desde el cliente
  socket.on('mensajeDesdeCliente', (data) => {
    console.log(`Mensaje desde cliente recibido: ${JSON.stringify(data)}`);

    // Enviar un mensaje al cliente
    socket.emit('mensajeDesdeServidor', { mensaje: 'Hola, cliente!' });
  });

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

