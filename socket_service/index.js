const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
const RabbitMQConnection = require("./services/rabbitMq");
const redisAdapter = require('@socket.io/redis-adapter');
const {createClient} = require('redis');
const UIDGenerator = require('uid-generator');

require('dotenv').config();
/* pulls the Redis URL from .env */


require('dotenv').config();
const uidgen = new UIDGenerator(); 


const QUEUE_NAME_SOLICITUDES = "solicitudes";
const QUEUE_NAME_OFERTAS = "ofertas";

const app = express();

const server = http.createServer(app);

let socketInstance = null;

let connection = null;
let channel = null;

// Lista de usuarios conectados
let connectedUsers = [];




var id_server_instance = uidgen.generateSync()

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
        if (!message) {
          console.error("no llegan mensajes rabbit en socket");
          return false;
        }


        loadUsers()

        
        const solicitud = JSON.parse(message.content.toString());
        console.info(
          `comando recibido en socket ${solicitud.service} cmd ${solicitud.cmd}`
        );

        if (solicitud.service == "oferta" && solicitud.cmd == "SAVED") {
          console.log("se guardo oferta desde el servicio");
          // io.of("/socket")
          //   .to("solicitud_"+solicitud.oferta.solicitud)
          //   .emit("seToffers", {
          //     offers: [solicitud.oferta],
          //     lastOferUpdate: null,
          //   });

          if (!solicitud.oferta) {
            

           return false;
          
          }

          const QUEUE_NAME = "ofertas";
          const requestPayloadO = {
            service: "oferta",
            cmd: "GETPENDINGS",
            solicitud: solicitud.oferta.solicitud,
          };

          if (channel) {
            channel.sendToQueue(
              QUEUE_NAME,
              Buffer.from(JSON.stringify(requestPayloadO)),
              { persistent: true }
            );

            console.log(
              `>>>>>>>>>> solicitando lista ofertas pendientes para esta solicitud pendiente de el cliente `
            );

            // Obtener el objeto socket del usuario correspondiente
            channel.ack(message); // Eliminar la solicitud de la cola
          }
        }

        if (
          solicitud.service == "oferta" &&
          solicitud.cmd == "HAVE_PENDINGS_SOLICITUD"
        ) {
          //enviar ofertas al cliente si esta conectado
          

          if (pickedf) {
            console.log(
              "enviando ofertas pendientes a solicitud de cliente ",
              solicitud
            );

            io.of("/socket").to(pickedf.id).emit("seToffers", {
              offers: solicitud.ofertas,
              lastOferUpdate: null,
            });
          }

            if ((pickedf && pickedf.server_instance === id_server_instance) || !pickedf) {
          channel.ack(message); // Eliminar la solicitud de la cola
          }  
       
        }

        // Procesar la solicitud aquí

        if (
          solicitud.service == "solicitud" &&
          solicitud.cmd == "ACCEPT_SOLICITUD"
        ) {

          console.clear()
          console.log("enviando notificacion de solicitud aceptada");

          io.of("/socket")
            .to("solicitud_" + solicitud.solicitud._id)
            .emit("offerAccept", {
              sol: solicitud.solicitud,
              offer: solicitud.oferta,
            });

            
            
            //notificando al contratista si no estan en esta sala
            
            var pickedf = connectedUsers.find(
              (x) => x.userName == solicitud.solicitud.id_driver
            );

            if(pickedf){
              io.of("/socket")
                .to(pickedf.id)
                .emit("offerAccept", {
                  sol: solicitud.solicitud,
                  offer: solicitud.oferta,
                });
              
            }
  

          const QUEUE_NAME = "solicitudes";
          console.log("solicitando lista de solicitudes por hacer");
          const requestPayload = { service: "solicitud", cmd: "GETPENDINGS" };

          if (channel) {
            channel.sendToQueue(
              QUEUE_NAME,
              Buffer.from(JSON.stringify(requestPayload)),
              { persistent: false }
            );

            console.log(
              `>>>>>>>>>> solicitando lista solcitudes pendientes a cotratistas `
            );
          }

            if ((pickedf && pickedf.server_instance === id_server_instance) || !pickedf) {
            channel.ack(message); // Eliminar la solicitud de la cola
            }  

          
        }

        if (
          solicitud.service === "solicitud" &&
          solicitud.cmd === "HAVE_PENDINGS_DRIVERS"
        ) {
          console.log("enviando solicitudes pendientes a contratistas");

          console.log("salas ", io.of("/socket").adapter.rooms);

          io.of("/socket")
            .to("contratistas")
            .emit("solicitudes_abiertas", solicitud.solicitudes);

          channel.ack(message); // Eliminar la solicitud de la cola
        }

        if (
          solicitud.service == "solicitud" &&
          solicitud.cmd == "HAVE_PENDING"
        ) {

          console.log("------------------>>>>> pendiente solicitud usuario ",solicitud._id)

          if(!solicitud.solicitud){

            //no tiene solicitud pendiente
            channel.ack(message); // Eliminar la solicitud de la cola
            
            return false
          }

          var pickedf = connectedUsers.find(
            (x) => x.userName == solicitud.user._id
          );

          if (solicitud.solicitud !== null) {
            if (pickedf) {
              console.log(
                "enviando a cliente socket app react solicitud pendiente "
              );

              io.of("/socket")
                .to(pickedf.id)
                .emit("seTsolicitud", { sol: solicitud.solicitud, offers: [] });

              const QUEUE_NAME = "ofertas";
              const requestPayload = {
                service: "oferta",
                cmd: "GETPENDINGS",
                solicitud: solicitud.solicitud,
              };

              if (channel) {
                channel.sendToQueue(
                  QUEUE_NAME,
                  Buffer.from(JSON.stringify(requestPayload)),
                  { persistent: true }
                );

                console.log(
                  `>>>>>>>>>> solicitando lista ofertas pendientes para esta solicitud pendiente de el cliente `
                );
              }
            } else {
              console.log(
                "no se envia al cliente la solicitud pendiente porque se  ha desconectado. "
              );
            }
          } else {
            console.log("no tiene solicitudes pendientes");
          }

            if ((pickedf && pickedf.server_instance === id_server_instance) || !pickedf) {
            channel.ack(message); // Eliminar la solicitud de la cola
            }  


        }

        if (solicitud.service == "solicitud" && solicitud.cmd == "SAVED") {
          console.log("antes de errort ", solicitud.solicitud);
          var pickedf = connectedUsers.find(
            (x) => x.userName == solicitud.solicitud.id_client
          );

          if (pickedf) {
            console.log("enviando a cliente socket app react solicitud creada");

            io.of("/socket")
              .to(pickedf.id)
              .emit("seTsolicitud", { sol: solicitud.solicitud, offers: [] });

            const QUEUE_NAME = "solicitudes";
            console.log("solicitando lista de solicitudes por hacer");
            const requestPayload = { service: "solicitud", cmd: "GETPENDINGS" };

            if (channel) {
              console.log("enviar lista de solicitudes habilitada")
              channel.sendToQueue(
                QUEUE_NAME,
                Buffer.from(JSON.stringify(requestPayload)),
                { persistent: false }
              );

              console.log(
                `>>>>>>>>>> solicitando lista solcitudes pendientes a cotratistas `
              );

              
            }
          } else {
            console.log(
              "no se envia al cliente la solicitud pendiente porque se  ha desconectado. "
            );
          }

            if ((pickedf && pickedf.server_instance === id_server_instance) || !pickedf) {
            channel.ack(message); // Eliminar la solicitud de la cola
            }  


        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error(error);
  }
};

const setRddisUsers = async(usersUpdate)=>{

  const url = process.env.REDIS_SERVER
  const pubClient = createClient({ url: url });

  await pubClient.connect()
  
  //const subClient = pubClient.duplicate()
  
  pubClient.on('error', (err) => console.log('Redis Client Error', err));
  

  await pubClient.set('userListSocketShare',JSON.stringify(usersUpdate));

}

const loadUsers = async (socket) => {
  const url = process.env.REDIS_SERVER
  const pubClient = createClient({ url: url });

  await pubClient.connect()
  
  //const subClient = pubClient.duplicate()
  
  pubClient.on('error', (err) => console.log('Redis Client Error', err));
  
const usersList = await pubClient.get('userListSocketShare');


console.log("Vl from rds in socket ",usersList)

if(usersList){
  connectedUsers = JSON.parse(usersList);
}else{
  connectedUsers = [];
}


}

loadUsers()

const checkUsers = async (socket) => {
  const url = process.env.REDIS_SERVER
  const pubClient = createClient({ url: url });

  await pubClient.connect()
  
  //const subClient = pubClient.duplicate()
  
  pubClient.on('error', (err) => console.log('Redis Client Error', err));
  
    
  
  var pickedf = connectedUsers.find(
    (x) => x.userName == socket.handshake.query.cliente
  );

  //console.log("pkc ", pickedf);

  if (!pickedf) {
    if (socket.handshake.query.cliente) {
      console.log("registrando nuevo cliente en server ",id_server_instance);

    
      connectedUsers.push({
        id: socket.id,
        userName: socket.handshake.query.cliente,
        nombres: socket.handshake.query.username,
        //push_id : userName.push_id ,
        tipo: socket.handshake.query.tipo,
        server_instance:id_server_instance
      });
    } else {
      console.log("user indefinido ", socket.handshake.query);
    }
  } else {
    connectedUsers.forEach(function (item) {
      if (item.userName == pickedf.userName && item.id !== socket.id) {
        console.log("Socket de usuario actualizado en server "+id_server_instance+' - '+socket.handshake.query.tipo);
        item.id = socket.id;
        item.server_instance = id_server_instance
      }
    });
  }



  // serUsers
await pubClient.set('userListSocketShare',JSON.stringify(connectedUsers));


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




// io.adapter(redisAdapter(pubClient, subClient, {
//   publishOnSpecificResponseChannel: true
// }));


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

  if (socket.handshake.query.tipo == "contratista") {
    socket.join("contratistas");

    const QUEUE_NAME = "solicitudes";
    console.log("solicitando lista de solicitudes por hacer");
    const requestPayload = { service: "solicitud", cmd: "GETPENDINGS" };

    if (channel) {
      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(requestPayload)),
        { persistent: false }
      );

      console.log(
        `>>>>>>>>>> solicitando lista solcitudes pendientes a cotratistas `
      );
    }
  }

  if (socket.handshake.query.tipo == "cliente") {
    console.log("ingresando el cliente ala la sala contratantes");
    socket.join("contratantes");
  }

  socket.on("keep-alive", () => {
    checkUsers(socket);
  });

  checkUsers(socket);

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

    console.log(
      `>>>>>>>>>> solicitando pendientes a usuario ${
        data.nombres
      }`);
   
    if (channel) {
      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(requestPayload)),
        { persistent: true }
      );

      
    }else{
      console.log("No hay conexion con el broker de mensajes")
    }
  });

  socket.on("locationDriverSend",(data)=>{
     console.clear()
    console.log("Ubicacion driver solicitud_"+data.requisition._id, data.location);
    io.of("/socket").to("solicitud_" + data.requisition._id).emit(
      "locationDriverLoad",
      data.location
    );

  })


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
        ),
        { persistent: true }
      );

      console.log(`>>>>>>>>>> Sent nueva solicitud hacia cola solicitudes`);
    }
  });

  socket.on("aceptar_solicitud_driver_oferta", (payload) => {
    const QUEUE_NAME = "solicitudes";
    if (channel) {
      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(
          JSON.stringify({
            service: "solicitud",
            cmd: "ACCEPT",
            oferta: payload.oferta,
            solicitud: payload.solicitud,
          })
        ),
        { persistent: true }
      );

      channel.sendToQueue(
        "ofertas",
        Buffer.from(
          JSON.stringify({
            service: "ofertas",
            cmd: "ACCEPT",
            oferta: payload.oferta,
            solicitud: payload.solicitud,
          })
        ),
        { persistent: true }
      );

      console.log(
        `>>>>>>>>>> Sent nueva solicitud aprobada hacia cola solicitudes`
      );
    }
  });

  socket.on("aceptar_solicitud_driver_valor_solicitud", (oferta) => {});

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
        ),
        { persistent: true }
      );

      console.log(`>>>>>>>>>> Sent nueva oferta hacia cola ofertas `);
    }
  });

  socket.on("setTarifaClient", (payload) => {
    console.clear();
    console.log("Valor de servicio actualizado", payload);
    //actualizar solicitud

    const QUEUE_NAME = "solicitudes";
    const oferta = payload;

    if (channel) {
      channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(
          JSON.stringify({
            service: "solicitud",
            cmd: "CHANGE_TARIFA",
            tarifa: payload,
          })
        ),
        { persistent: true }
      );

      console.log(`>>>>>>>>>> Sent nueva tarifa a solicitudes `);
    }
  });

socket.on("terminar_solicitud",(solicitud)=>{

  io.of("/socket").to("solicitud_" + solicitud._id).emit(
    "terminateService",
    { finishBy: "user", sol: { ...solicitud, status: "Cerrada" } }
  );

 var rooms = io.of("/socket").adapter.rooms

  // Verificar si la sala "miSala" existe
if (rooms.hasOwnProperty("solicitud_" + solicitud._id)) {
  // Eliminar la sala "miSala"
  io.sockets.adapter.del("solicitud_" + solicitud._id);
  console.log("sala eliminada")
}

  const QUEUE_NAME = "solicitudes";
 

  if (channel) {
    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(
        JSON.stringify({
          service: "solicitud",
          cmd: "FINISH",
          solicitud: solicitud,
        })
      ),
      { persistent: true }
    );

    console.log(`>>>>>>>>>> Sent nueva tarifa a solicitudes `);
  
  }


})
  


  // Manejar desconexiones del cliente
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);

    connectedUsers = connectedUsers.filter((x) => x.id !== socket.id);
    // Obtener las salas a las que está unido el usuario
    setRddisUsers(connectedUsers);
    const rooms = Object.keys(io.of("/socket").adapter.rooms);

    // Recorrer las salas y sacar al usuario de cada una
    rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
        console.log(`Usuario ${socket.id} ha salido de la sala ${room}`);
      }
    });
  });
});

//enviar cola
send_rabbit_socket();

server.listen(3004, () => {
  console.log("Servidor Socket.io escuchando en el puerto 3004 - id= "+id_server_instance);
});
