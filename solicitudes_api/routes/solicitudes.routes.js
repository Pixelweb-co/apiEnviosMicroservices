const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');

const RabbitMQConnection = require('../services/rabbitMq');

const QUEUE_NAME = 'solicitudes'

// // Ruta protegida que requiere un token de acceso válido
// router.get('/auth/protected', authController.verifyToken, (req, res) => {
//   res.json({ message: 'Bienvenido a la ruta protegida' });
// });

router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a solicitudes api' });
});


router.post('/', async (req, res) => {
  const solicitud = req.body;

  const connection = await RabbitMQConnection.connect();
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(solicitud)));

  console.log(`Sent solicitud: ${solicitud}`);

  res.status(200).json({ message: 'Solicitud sent successfully' });
});


router.post('/lastlocation',solicitudController.lastlocation);


module.exports = router;