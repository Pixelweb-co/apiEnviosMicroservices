const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const RabbitMQConnection = require("./services/rabbitMq");
//const SolicitudContorller = require('./controllers/solicitudController')
const Solicitud = require("./models/solicitudModel");

const solicitudesRoutes = require("./routes/solicitudes.routes");

const app = express();

//Conectar a la base de datos
mongoose
  .connect("mongodb://" + process.env.DB_HOST + ":27017/solicitudes_api", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conexión exitosa a la base de datos");
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos", err);
  });

const send_rabbit_requisitions = async (connection) => {
  try {
    // Conectarse a RabbitMQ

    const connection = await RabbitMQConnection.connect();

    const channel = await connection.createChannel();
    const queueName = "solicitudes";
    const queueSocketName = "socket";

    await channel.assertQueue(queueName, { durable: true });
    console.log(`La cola ${queueName} se ha creado correctamente`);

    console.log("Esperando mensajes de cola solicitudes...");

    channel.consume(queueName, async (message) => {
      if(!message.content){
        return false
      }
      const solicitudFrom = JSON.parse(message.content.toString());

      console.log(
        `Solicitud recibida desde la cola solicitudes: ${JSON.stringify(
          solicitudFrom
        )}`
      );

      if (solicitudFrom.cmd == "GETPENDINGS") {
        const solicitudes_pendiente = await Solicitud.find({
          status: "PENDING",
        });

        channel.ack(message); // Eliminar la solicitud de la cola
        console.log(
          `Enviando solicitudes pendientes a los conductores : ${JSON.stringify(
            solicitudes_pendiente
          )}`
        );
        channel.sendToQueue(
          queueSocketName,
          Buffer.from(
            JSON.stringify({
              service: "solicitud",
              cmd: "HAVE_PENDINGS_DRIVERS",
              solicitudes: solicitudes_pendiente,
            })
          ),
          { persistent: true }
        );
      }

      // Procesar la solicitud aquí
      if (solicitudFrom.cmd == "PENDINGSUSER") {
        console.clear();
        if (solicitudFrom.user.tipo == "cliente") {
          // Buscar un documento utilizando una promesa
          const solicitud_pendiente = await Solicitud.findOne({
            id_client: solicitudFrom.user._id,
            $or: [
              { status: "PENDING" },
              { status: "Abierta" },
              { status: "Cerrada", ratedDriver: null },
            ],
          });

          channel.ack(message); // Eliminar la solicitud de la cola
          console.log(
            `Solicitud pendiente en servicio : ${JSON.stringify(
              solicitud_pendiente
            )}`
          );

          channel.sendToQueue(
            queueSocketName,
            Buffer.from(
              JSON.stringify({
                service: "solicitud",
                cmd: "HAVE_PENDING",
                solicitud: solicitud_pendiente,
                user: solicitudFrom.user,
                socket: solicitudFrom.socket,
              })
            ),
            { persistent: true }
          );
        }

        if (solicitudFrom.user.tipo == "contratista") {
          console.log("buscando solicitud " + solicitudFrom.user.tipo);

          const solicitud_pendiente = await Solicitud.findOne({
            id_driver: solicitudFrom.user._id,
            $or: [
              { status: "Abierta" },
              { status: "Cerrada", ratedDriver: null },
            ],
          });

          if (!solicitud_pendiente) {
            console.log("No tiene pendientes como contratista");
            //si no tiene como contratista ver si tiene como cliente
            const solicitud_pendiente_c = await Solicitud.findOne({
              id_client: solicitudFrom.user._id,
              $or: [{ status: "PENDING" }, { status: "Abierta" }],
            });

            if (!solicitud_pendiente_c) {
              console.log("disponible para trabajar");
              channel.ack(message); // Eliminar la solicitud de la cola

              return false;
            } else {
              channel.ack(message); // Eliminar la solicitud de la cola
              console.log(
                `Solicitud pendiente contratista como cliente : ${JSON.stringify(
                  solicitud_pendiente_c
                )}`
              );

              channel.sendToQueue(
                queueSocketName,
                Buffer.from(
                  JSON.stringify({
                    service: "solicitud",
                    cmd: "HAVE_PENDING",
                    solicitud: solicitud_pendiente_c,
                    user: solicitudFrom.user,
                    socket: solicitudFrom.socket,
                  })
                ),
                { persistent: true }
              );
            }
          } else {
            channel.ack(message); // Eliminar la solicitud de la cola

            console.log(
              `Solicitud pendiente trabajando : ${JSON.stringify(
                solicitud_pendiente
              )}`
            );

            channel.sendToQueue(
              queueSocketName,
              Buffer.from(
                JSON.stringify({
                  service: "solicitud",
                  cmd: "HAVE_PENDING",
                  solicitud: solicitud_pendiente,
                  user: solicitudFrom.user,
                  socket: solicitudFrom.socket,
                })
              ),
              { persistent: true }
            );
          }
        }
      }

      // Procesar la solicitud aquí
      if (solicitudFrom.cmd == "NEW") {
        var pendingSolicitud = solicitudFrom.solicitud;

        //pendingSolicitud.status="PENDING"

        const solicitud = new Solicitud(pendingSolicitud);

        var newSolicitud = await solicitud.save();

        channel.ack(message); // Eliminar la solicitud de la cola
        console.log(
          `Solicitud creada en servicio : ${JSON.stringify(newSolicitud)}`
        );

        channel.sendToQueue(
          queueSocketName,
          Buffer.from(
            JSON.stringify({
              service: "solicitud",
              cmd: "SAVED",
              solicitud: newSolicitud,
            })
          ),
          { persistent: true }
        );
      }
    });
  } catch (error) {
    console.error(error);
  }
};

//enviar solicitudes pendientes a estado de cola
send_rabbit_requisitions();

// Configurar la aplicación
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar las rutas
app.use("/solicitudes", solicitudesRoutes);

// Iniciar la aplicación
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor en línea en el puerto ${PORT}`);
});
