const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = 'my-secret';

exports.signup = async (req, res) => {
  const { nombres, email, password,telefono } = req.body;
  // Validar campos obligatorios
  if (!nombres || !email || !password || !telefono) {
    return res.status(400).json({result:"FAILURE", message: 'Nombre, correo electrónico, telefono y contraseña son requeridos' });
  }

  // Verificar si el telefono ya está registrado
  const existingTelefono = await User.findOne({ telefono });
  if (existingTelefono) {
    return res.status(400).json({result:"FAILURE", message: 'El número de teléfono ya está registrado' });
  }

  
  
  // Verificar si el correo electrónico ya está registrado
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({result:"FAILURE", message: 'El correo electrónico ya está registrado' });
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el usuario
  const user = new User({
    nombres,
    email,
    telefono,
    password: hashedPassword,
    tipo:"cliente",
    estado: "Active",
    act_code: "",
    avatar: "noImg.png",
  });


  // Guardar el usuario en la base de datos
  try {
    newUser = await user.save();

    
    // Generar el token de acceso
  const accessToken = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '15m' });

  // Generar el token de actualización
  const refreshToken = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

  // Guardar el token de actualización en la base de datos
  newUser.refreshToken = refreshToken;
  await newUser.save();

    
    console.log("req ",{result:"SUCCESS", message: 'Su registro fue exitoso.',user: newUser,authToken:accessToken})

    res.status(201).json({result:"SUCCESS", message: 'Su registro fue exitoso.',user: newUser,authToken:"1234"});
  } catch (err) {
    res.status(500).json({result:"FAILURE", message: 'Ocurrió un error al crear el usuario' });
  }
};

exports.login = async (req, res) => {
  console.log("login ",req.body)
  const { email, password } = req.body;

  // Validar campos obligatorios
  if (!email || !password) {
    return res.status(400).json({result:"FAILURE", message: 'Correo electrónico y contraseña son requeridos' });
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

  res.json({result:"SUCCESS", accessToken, refreshToken ,user:user});
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


exports.check_telefono = async(req, res, next) => {
    
    const { telefono } = req.body;
    console.log("check telefono")
    // Validar campos obligatorios
    if (!telefono) {
      return res.status(400).json({ message: 'Telefono es requeridos' });
    }
  
    // Verificar si el telefono existe
    const telefono_exist = await User.findOne({ telefono });
    if (!telefono_exist) {
      console.log("no exist")
      return res.status(200).json({result:"no_exist", message: 'Telefono no existe' });
    }else{
      return res.status(200).json({result:"found", message: 'Telefono existe' });
    }
  
  };

  

exports.check_email = async(req, res, next) => {
  console.log("check email")
  const { email } = req.body;

  // Validar campos obligatorios
  if (!email) {
    console.log("no exist")
    return res.status(400).json({ message: 'email es requeridos' });
  }

  // Verificar si el email existe
  const email_exist = await User.findOne({ email });
  if (!email_exist) {
    return res.status(200).json({result:"no_exist", message: 'email no existe' });
  }else{
    return res.status(200).json({result:"found", message: 'email existe' });
  }

};


exports.check_cedula = async(req, res, next) => {
  const { cedula } = req.body;
  console.log("check cedula ", cedula)
 
  // Validar campos obligatorios
  if (!cedula) {
    console.log("no exist")
    return res.status(400).json({ message: 'cedula es requeridos' });
  }

  // Verificar si el cedula existe
  const cedula_exist = await User.findOne({ cedula });
  if (!cedula_exist) {
    return res.status(200).json({result:"no_exist", message: 'cedula no existe' });
  }else{
    return res.status(200).json({result:"found", message: 'cedula existe' });
  }

};



//obtener usuario
exports.getuser = async(req, res, next) => {
    
    const user = await User.findById(req.body.user_id);

    if (!user) {
      return res.status(200).send({ error: "No existe." });
    } else {
      return res.status(200).send(user);
    }
  
}

exports.getusers = async(req, res, next) => {
  const { users } = req.body;
  console.log("check users ", users)
 
  // Validar campos obligatorios
  if (!users) {
    console.log("no exist")
    return res.status(400).json({ message: 'users es requeridos' });
  }

  // Verificar si el users existe
  const users_exist = await User.find({ _id: { $in: users } });
  if (!users_exist) {
    return res.status(200).json({result:"no_exist", message: 'users no existe' });
  }else{
    return res.status(200).json({result:"SUCCESS", users:users_exist });
  }

};

exports.updateuser = async (req, res) => {
  try {
    const userUpdate = await User.findByIdAndUpdate(
      req.body.user_id,
      req.body.user_data,
      {upsert:true, new: true }
    );
    res.status(200).json(userUpdate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

 
}