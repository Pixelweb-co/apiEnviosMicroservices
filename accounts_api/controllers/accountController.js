const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = 'my-secret';

exports.signup = async (req, res) => {
  const { nombres, email, password,telefono } = req.body;
  console.log("req ",req.body)
  // Validar campos obligatorios
  if (!nombres || !email || !password || ! telefono) {
    return res.status(400).json({ message: 'Nombre, correo electrónico, telefono y contraseña son requeridos' });
  }

  // Verificar si el correo electrónico ya está registrado
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el usuario
  const user = new User({
    nombres,
    email,
    telefono,
    password: hashedPassword
  });


  // Guardar el usuario en la base de datos
  try {
    await user.save();
    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Ocurrió un error al crear el usuario' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validar campos obligatorios
  if (!email || !password) {
    return res.status(400).json({ message: 'Correo electrónico y contraseña son requeridos' });
  }

  // Verificar si el usuario existe
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Credenciales inválidas' });
  }

  // Verificar la contraseña
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Credenciales inválidas' });
  }

  // Generar el token de acceso
  const accessToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });

  // Generar el token de actualización
  const refreshToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  // Guardar el token de actualización en la base de datos
  user.refreshToken = refreshToken;
  await user.save();

  res.json({ accessToken, refreshToken });
};

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
  
    try {
      const decodedToken = jwt.verify(token, JWT_SECRET);
      req.userData = { userId: decodedToken.userId, email: decodedToken.email };
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
