const express = require('express');
const router = express.Router();
const authController = require('../controllers/accountController');

router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);

// Ruta para verificar la validez del token de acceso
router.post('/auth/token', authController.verifyToken, (req, res) => {
  res.json({ message: 'Token válido' });
});

// Ruta protegida que requiere un token de acceso válido
router.get('/auth/protected', authController.verifyToken, (req, res) => {
  res.json({ message: 'Bienvenido a la ruta protegida' });
});

router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a account api' });
});


module.exports = router;