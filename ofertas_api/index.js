const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const RabbitMQConnection = require("./services/rabbitMq");
//const ofertaContorller = require('./controllers/ofertaController')
const Oferta = require("./models/ofertaModel");

const ofertasRoutes = require("./routes/ofertas.routes");

const app = express();

//Conectar a la base de datos
mongoose
  .connect("mongodb://" + process.env.DB_HOST + ":27017/ofertas_api", {
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
    const queueName = "ofertas";
    const queueNameS = "socket";

    await channel.assertQueue(queueName, { durable: true });
    console.log(`La cola ${queueName} se ha creado correctamente`);

    // Enviar ofertas a RabbitMQ
    // ofertas.forEach((oferta) => {
    //   channel.sendToQueue(queueName, Buffer.from(JSON.stringify(oferta)));
    // });

    //console.log(`Se han enviado ${ofertas.length} ofertas pendientes a la cola "${queueName}"`);

    console.log("Esperando eventos en el servicio...");

    channel.consume(queueName, async (message) => {
      const ofertaFrom = JSON.parse(message.content.toString());

      console.log(
        `comando desde cola de ofertas: ${JSON.stringify(ofertaFrom)}`
      );

      if (ofertaFrom.cmd == "GETPENDINGS") {
        console.log("consultando ofertas de solicitud: ", ofertaFrom);

        const ofertas_pendientes = await Oferta.find({
          solicitud: ofertaFrom.solicitud,
          estado: "PENDING",
        });

        channel.ack(message); // Eliminar comando de la cola
        console.log(
          `Enviando ofertas pendientes de solicitud : ${JSON.stringify(
            ofertas_pendientes
          )}`
        );

        if(ofertas_pendientes.length>0){
        channel.sendToQueue(
          queueNameS,
          Buffer.from(
            JSON.stringify({
              service: "oferta",
              cmd: "HAVE_PENDINGS_SOLICITUD", 
              ofertas: ofertas_pendientes,
              solicitud: ofertaFrom.solicitud,
            })
          ),
          { persistent: true }
        );
          }
      }


      if (ofertaFrom.cmd == "ACCEPT") {
      
        await Oferta.findOneAndUpdate(
        {solicitud: pendingoferta.solicitud._id},
        {...pendingoferta.oferta,estado:"CLOSE"},
        {upsert: true,new:true }
        )

        await Oferta.findOneAndUpdate(
          {_id: pendingoferta.oferta._id},
          {estado:"ACCEPT"},
          {upsert: true,new:true }
          )

        console.log("oferta aprobada") 
          
        channel.ack(message); // Eliminar la oferta de la cola


      }

      // Procesar la oferta aquí
      if (ofertaFrom.cmd == "NEW") {
        var pendingoferta = ofertaFrom.oferta;

        pendingoferta.estado = "PENDING";

        //const oferta = new Oferta(pendingoferta);

        var newoferta = await Oferta.findOneAndUpdate({
          contratista: pendingoferta.contratista,
          solicitud: pendingoferta.solicitud,
          estado: "PENDING",
        },
        pendingoferta,
        {upsert: true,new:true },
        ).then(ofertaDb => {

          console.log(`nueva oferta creada/actualizada en servicio:`,ofertaDb);

                 
        channel.sendToQueue(
          queueNameS,
          Buffer.from(
            JSON.stringify({
              service: "oferta",
              cmd: "SAVED",
              oferta: ofertaDb,
            })
          ),
          { persistent: true }
        );

          channel.ack(message); // Eliminar la oferta de la cola

        }).catch(error=>console.log("Error al enviar oferta a la db ",error))

       

      }
    });
  } catch (error) {
    console.error(error);
  }
};

//enviar ofertas pendientes a estado de cola
send_rabbit_requisitions();

// Configurar la aplicación
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar las rutas
app.use("/ofertas", ofertasRoutes);

// Iniciar la aplicación
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor en línea en el puerto ${PORT}`);
});
