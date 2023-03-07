const JWT_SECRET = 'my-secret';

const Oferta = require('../models/ofertaModel');

const getofertas = async (req, res) => {
  try {
    const ofertas = await Oferta.find();
    res.status(200).json(ofertaes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getofertaById = async (req, res) => {
  try {
    const oferta = await Oferta.findById(req.params.id);
    if (!oferta) {
      return res.status(404).json({ message: 'No se encontró la oferta' });
    }
    res.status(200).json(oferta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createoferta = async (req, res) => {
  const oferta = new oferta(req.body);
  try {
    const newoferta = await Oferta.save();
    res.status(201).json(newoferta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const createFromSocket = async (ofertaPayload) => {
    const oferta = new oferta(ofertaPayload);

    var newoferta = await Oferta.save();
    console.log("create controller ",newoferta)
 
    return {...newoferta};

  };

const updateoferta = async (req, res) => {
  try {
    const oferta = await Oferta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(oferta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteoferta = async (req, res) => {
  try {
    const oferta = await Oferta.findByIdAndDelete(req.params.id);
    if (!oferta) {
      return res.status(404).json({ message: 'No se encontró la oferta' });
    }
    res.status(200).json({ message: 'oferta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const lastlocation = async (req, res)=> {
  console.log("obteniendo ultima ubicacion ",req.body.user);

  Oferta.findOne({ id_client: req.body.user, status: "Cerrada" })
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
  getofertas,
  getofertaById,
  createoferta,
  createFromSocket,
  updateoferta,
  deleteoferta,
  lastlocation,
  verifyToken
};
