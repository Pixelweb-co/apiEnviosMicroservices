const express = require('express');
const amqp = require('amqplib');

const app = express();
const PORT = process.env.PORT || 3005;

const RabbitMQCluster = async () => {
  const connection1 = await amqp.connect('amqp://admin:admin@rabbitmq:5672');
  const connections = [connection1];

  const channel1 = await connection1.createChannel();
  const channels = [channel1];

  await channel1.assertQueue('solicitudes');
  
  console.log('RabbitMQ cluster is ready');

  const monitoringService = setInterval(async () => {
    for (let i = 0; i < connections.length; i++) {
      const connection = connections[i];
      const channel = channels[i];

      try {
        const result = await channel.checkQueue('solicitudes');
        console.log(`Queue1 on node${i + 1}: ${result.messageCount} messages`);
      } catch (err) {
        console.log(`Error checking queue1 on node${i + 1}: ${err}`);
      }
    }
  }, 5000);
};

RabbitMQCluster();

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
