const express = require('express');
const router = express.Router();
const authController = require('../controllers/accountController');

router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);


// Ruta para verificar la validez del token de acceso
router.post('/auth/token', authController.verifyToken, (req, res) => {
  res.json({ message: 'Token válido' });
});

//ruta actualizar usuario
router.post('/updateuser',authController.updateuser)

//ruta checkear telefono
router.post('/checktelefono',authController.check_telefono)

//ruta get users in ids
router.post('/getusers',authController.getusers)

//ruta checkear cedula
router.post('/checkcedula',authController.check_cedula)


//ruta checkear email
router.post('/checkemail',authController.check_email)

router.get('/pictures/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  res.sendFile('/uploads/' + imageName);
});

// Ruta protegida que requiere un token de acceso válido
router.get('/auth/protected', authController.verifyToken, (req, res) => {
  res.json({ message: 'Bienvenido a la ruta protegida' });
});

router.post('/getuser',authController.getuser);

router.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a account api' });
});



module.exports = router;