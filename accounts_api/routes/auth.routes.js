const express = require('express');
const router = express.Router();
const authController = require('../controllers/accountController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Ruta para verificar la validez del token de acceso
router.post('/token', authController.verifyToken, (req, res) => {
  res.json({ message: 'Token válido' });
});

// Ruta protegida que requiere un token de acceso válido
router.get('/protected', authController.verifyToken, (req, res) => {
  res.json({ message: 'Bienvenido a la ruta protegida' });
});

module.exports = router;