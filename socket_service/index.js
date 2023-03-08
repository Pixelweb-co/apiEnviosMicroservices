const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
const RabbitMQConnection = require("./services/rabbitMq");

const QUEUE_NAME_SOLICITUDES = "solicitudes";
const QUEUE_NAME_OFERTAS = "ofertas";


const app = express();

const server = http.createServer(app);

let socketInstance = null;

let connection = null;
let channel = null;

// Lista de usuarios conectados
let connectedUsers = [];

const send_rabbit_socket = async (socket) => {
  try {
    // Conectarse a RabbitMQ
    connection = await RabbitMQConnection.connect();
    channel = await connection.createChannel();
    const queueName = "socket";

    await channel.assertQueue(queueName, { durable: true });
    console.log(`La cola ${queueName} se ha creado correctamente`);

    console.log("Esperando mensajes en la cola socket...");

    

    channel.consume(
      queueName, //escucha canal socket
      (message) => {
        if(!message.content){

          return false
        }
        const solicitud = JSON.parse(message.content.toString());
        console.log(
          `comando recibido en socket ${solicitud.service} cmd ${solicitud.cmd}`
        );

            if (solicitud.service == 'oferta' && solicitud.cmd == "SAVED") {
            console.log("se guardo oferta desde el servicio")  
            // io.of("/socket")
            //   .to("solicitud_"+solicitud.oferta.solicitud)
            //   .emit("seToffers", {
            //     offers: [solicitud.oferta],
            //     lastOferUpdate: null,
            //   });

            const QUEUE_NAME = "ofertas";
            const requestPayloadO = { service: "oferta", cmd: "GETPENDINGS", solicitud:solicitud.oferta.solicitud};
        
            if (channel) {
              channel.sendToQueue(
                QUEUE_NAME,
                Buffer.from(JSON.stringify(requestPayloadO)),
                {persistent:true}
              );
        
              console.log(
                `>>>>>>>>>> solicitando lista ofertas pendientes para esta solicitud pendiente de el cliente `
              );
  
            // Obtener el objeto socket del usuario correspondiente
            channel.ack(message); // Eliminar la solicitud de la cola
          }
        }

          if (solicitud.service == 'oferta' && solicitud.cmd == "HAVE_PENDINGS_SOLICITUD") {                     
          //enviar ofertas al cliente si esta conectado
            var pickedf = connectedUsers.find(
              (x) => x.userName == solicitud.ofertas[0].contratante
            );
            
  
            if (pickedf) {
              console.log("enviando ofertas pendientes a solicitud de cliente ",solicitud);
           
  
              io.of("/socket")
                .to(pickedf.id)
                .emit("seToffers", {
                  offers: solicitud.ofertas,
                  lastOferUpdate: null,
                });
      
                channel.ack(message); // Eliminar la solicitud de la cola
      
      
          }
  
        }

        // Procesar la solicitud aquí

        if (solicitud.service == 'solicitud' && solicitud.cmd == "HAVE_PENDINGS_DRIVERS") {
          console.log("enviando solicitudes pendientes a contratistas");
          
          console.log("salas ", io.of("/socket").adapter.rooms);
         
          
          io.of("/socket")
            .to("contratistas")
            .emit("solicitudes_abiertas", solicitud.solicitudes);
         
          channel.ack(message); // Eliminar la solicitud de la cola
           
        }

        if (solicitud.service == 'solicitud' && solicitud.cmd == "HAVE_PENDING") {
          var pickedf = connectedUsers.find(
            (x) => x.userName == solicitud.user._id
          );

          if (pickedf) {
            console.log(
              "enviando a cliente socket app react solicitud pendiente "
            );

            io.of("/socket")
              .to(pickedf.id)
              .emit("seTsolicitud", { sol: solicitud.solicitud, offers: [] });
            channel.ack(message); // Eliminar la solicitud de la cola
    
    
            const QUEUE_NAME = "ofertas";
            const requestPayload = { service: "oferta", cmd: "GETPENDINGS", solicitud:solicitud.solicitud};
        
            if (channel) {
              channel.sendToQueue(
                QUEUE_NAME,
                Buffer.from(JSON.stringify(requestPayload)),
                {persistent:true}
              );
        
              console.log(
                `>>>>>>>>>> solicitando lista ofertas pendientes para esta solicitud pendiente de el cliente `
              );
    
              }
    
          }else{
            console.log(
              "no se envia al cliente la solicitud pendiente porque se  ha desconectado. "
            ); 
          }
        }

        if (solicitud.service == 'solicitud' && solicitud.cmd == "SAVED") {
          
          console.log("antes de errort")
          var pickedf = connectedUsers.find(
            (x) => x.userName == solicitud.solicitud.id_client
          );

          if (pickedf) {
            console.log("enviando a cliente socket app react solicitud creada");

            io.of("/socket")
              .to(pickedf.id)
              .emit("seTsolicitud", { sol: solicitud.solicitud, offers: [] });

            // Obtener el objeto socket del usuario correspondiente
            channel.ack(message); // Eliminar la solicitud de la cola
          }else{
            console.log(
              "no se envia al cliente la solicitud pendiente porque se  ha desconectado. "
            ); 
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error(error);
  }
};

const checkUsers = (socket) => {
  var pickedf = connectedUsers.find(
    (x) => x.userName == socket.handshake.query.cliente
  );

  //console.log("pkc ", pickedf);

  if (!pickedf) {
    if (socket.handshake.query.cliente) {
      console.log("registrando nuevo cliente");

      connectedUsers.push({
        id: socket.id,
        userName: socket.handshake.query.cliente,
        nombres: socket.handshake.query.username,
        //push_id : userName.push_id ,
        tipo: socket.handshake.query.tipo,
      });
    } else {
      console.log("user indefinido ", socket.handshake.query);
    }
  } else {
   
    connectedUsers.forEach(function (item) {
      if (item.userName == pickedf.userName && item.id !== socket.id) {
         console.log("Socket de usuario actualizado");
        item.id = socket.id;
      }
    });
  }
};

const io = socketIO(server, {
  allowRequest: (req, callback) => {
    // Verificar si la solicitud es válida
    const isValid = true;
    // Llamar al callback con un booleano que indica si se permite la conexión
    callback(null, isValid);
  },
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors()); // Permitir solicitudes CORS desde cualquier origen

app.get("/", (req, res) => {
  return res.status(200).json({ result: "welcome to socket service" });
});

// Manejar conexiones Socket.io en la ruta `/socket`
io.of("/socket").on("connection", (socket) => {
  console.log(`Nuevo cliente conectado: ${socket.id}`);
  socketInstance = socket;

  console.log(
    "nuevo ususario user ",
    socket.id +
      " - id ususario: " +
      socket.handshake.query.cliente +
      " Terminal: " +
      socket.handshake.query.tipo
  );

  checkUsers(socket);

  if (socket.handshake.query.tipo == "contratista") {
    socket.join("contratistas");

    const QUEUE_NAME = "solicitudes";

    const requestPayload = { service: "solicitud", cmd: "GETPENDINGS" };

    if (channel) {
      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(requestPayload)),
        {persistent:false}
      );

      console.log(
        `>>>>>>>>>> solicitando lista solcitudes pendientes a cotratistas `
      );
    }
  }

  socket.on("keep-alive", () => {
    checkUsers(socket);
    
  });

  socket.on("joinRequisition", (data) => {
    console.log("ingreso a solicitud ", data.requisitionId);
    socket.leave("solicitud_" + data.requisitionId);
    socket.join("solicitud_" + data.requisitionId);

    console.log("salas ", io.of("/socket").adapter.rooms);
  });

  socket.on("solicitudPendiente", (data) => {
    const QUEUE_NAME = "solicitudes";

    const requestPayload = {
      service: "solicitud",
      cmd: "PENDINGSUSER",
      user: data,
      socketClient: socket.id,
    };

    if (channel) {
      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(requestPayload)),
       {persistent:true}
      );

      // console.log(
      //   `>>>>>>>>>> solicitando pendientes a usuario ${
      //     data.nombres
      //   }`
      // );
    }
  });

  //nueva solicitud
  socket.on("crear_solicitud_cliente", async (data, socketID) => {
    const QUEUE_NAME = "solicitudes";
    const solicitud = data;

    if (channel) {
      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(
          JSON.stringify({
            service: "solicitud",
            cmd: "NEW",
            solicitud: { ...solicitud, fecha: new Date() },
          })
        ),{persistent:true}
      );

      console.log(
        `>>>>>>>>>> Sent nueva solicitud hacia cola solicitudes`
      );
    }
  });

//nueva oferta
socket.on("setOffer", function (payload) {
  //console.clear();
  console.log("nueva oferta", payload);

  socket.join("solicitud_" + payload.solicitud);

  const QUEUE_NAME = "ofertas";
  const oferta = payload;

  if (channel) {
    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(
        JSON.stringify({
          service: "oferta",
          cmd: "NEW",
          oferta: { ...oferta, fecha: new Date() },
        })
      ),{persistent:true}
    );

    console.log(
      `>>>>>>>>>> Sent nueva oferta hacia cola ofertas `
    );
  }
})



  // Manejar desconexiones del cliente
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);


    connectedUsers = connectedUsers.filter(x=>x.id !== socket.id);

  });
});

//enviar cola
send_rabbit_socket();

server.listen(3004, () => {
  console.log("Servidor Socket.io escuchando en el puerto 3004");
});
