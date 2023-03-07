const express = require('express');
const router = express.Router();
const ofertaController = require('../controllers/ofertaController');

const RabbitMQConnection = require('../services/rabbitMq');

const QUEUE_NAME = 'ofertas'

// // Ruta protegida que requiere un token de acceso válido
// router.get('/auth/protected', authController.verifyToken, (req, res) => {
//   res.json({ message: 'Bienvenido a la ruta protegida' });
// });

router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a ofertas api' });
});


router.post('/', async (req, res) => {
  const oferta = req.body;

  const connection = await RabbitMQConnection.connect();
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME);
  //channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(oferta)));

  console.log(`Sent oferta: ${oferta}`);

  res.status(200).json({ message: 'oferta sent successfully' });
});

module.exports = router;