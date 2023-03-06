const User = require('../models/solicitudModel');

const JWT_SECRET = 'my-secret';


exports.verifyToken = (req, res, next) => {
      return res.status(200).json({ message: 'Token demo' });
  };
