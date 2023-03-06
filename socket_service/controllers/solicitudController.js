const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/solicitudModel');

const JWT_SECRET = 'my-secret';


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
