const User = require('../models/solicitudModel');

const JWT_SECRET = 'my-secret';

const Solicitud = require('../models/solicitudModel');

const getSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find();
    res.status(200).json(solicitudes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSolicitudById = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ message: 'No se encontró la solicitud' });
    }
    res.status(200).json(solicitud);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSolicitud = async (req, res) => {
  const solicitud = new Solicitud(req.body);
  try {
    const newSolicitud = await solicitud.save();
    res.status(201).json(newSolicitud);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const createFromSocket = async (solicitudPayload) => {
    const solicitud = new Solicitud(solicitudPayload);

    var newSolicitud = await solicitud.save();
    console.log("create controller ",newSolicitud)
 
    return {...newSolicitud};

  };

const updateSolicitud = async (req, res) => {
  try {
    const solicitud = await Solicitud.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(solicitud);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSolicitud = async (req, res) => {
  try {
    const solicitud = await Solicitud.findByIdAndDelete(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ message: 'No se encontró la solicitud' });
    }
    res.status(200).json({ message: 'Solicitud eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const lastlocation = async (req, res)=> {
  console.log("obteniendo ultima ubicacion ",req.body.user);

  Solicitud.findOne({ id_client: req.body.user, status: "Cerrada" })
    .sort({ _id: -1 })
    .exec(function (err, lastLocation) {
      if(lastLocation === null){
        console.log("no tiene ultima ubicacion")
        return res.status(200).send("");
      }
      console.log("last location get ", lastLocation); 
      return res.status(200).send(lastLocation.origin);
    });
}


const verifyToken = (req, res, next) => {
    return res.status(200).json({ message: 'Token demo' });
};


module.exports = {
  getSolicitudes,
  getSolicitudById,
  createSolicitud,
  createFromSocket,
  updateSolicitud,
  deleteSolicitud,
  lastlocation,
  verifyToken
};
