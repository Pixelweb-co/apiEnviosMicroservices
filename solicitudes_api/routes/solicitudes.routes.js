const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');



// // Ruta protegida que requiere un token de acceso válido
// router.get('/auth/protected', authController.verifyToken, (req, res) => {
//   res.json({ message: 'Bienvenido a la ruta protegida' });
// });

router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a solicitudes api' });
});


module.exports = router;