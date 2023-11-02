const Solicitud = require('../models/SolicitudContratistasModel'); 
const Vehiculo = require('../models/VehiculoModel'); 


exports.setSolicitud = (req, res) =>{
  const { driver, user_id, vehiculo,fecha,estado } = req.body;
  
  console.log(req.body)
  const solicitudI = new Solicitud({driver, user_id, vehiculo,fecha,estado}); 

  solicitudI.save() 
    .then(result => console.log(result) ) 
    .catch(err => console.log(err.message)); 

  }; 

  const update_solicitud = async (req, res) => {
    try {
      const solUpdate = await Solicitud.findByIdAndUpdate(
        req.body._id,
        req.body,
        { new: true }
      );
      res.status(200).json(solUpdate);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  


exports.getsolicitudes = async(req, res) =>{
    console.log("consultando solicitudes contratistas")
    try {
      const solicitudes = await Solicitud.find({estado:"PENDING"});
      res.status(200).json(solicitudes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  
  };


  exports.getsolicitud = async(req, res) =>{
    console.log("consultando solicitud contratista")
    try {
      const solicitud = await Solicitud.findOne({user_id:req.body.user});
      if(!solicitud){
      res.status(200).json({result:"FAILURE",solicitud:null});
      
      }
      res.status(200).json({result:"SUCCESS",solicitud:solicitud});
    } catch (error) {
      res.status(500).json({result:"ERROR", message: error.message });
    }
  
  };
  


  exports.check_placa = async(req, res, next) => {
    const { placa } = req.body;
    console.log("check placa ", placa)
   
    // Validar campos obligatorios
    if (!placa) {
      console.log("no exist")
      return res.status(400).json({ message: 'placa es requeridos' });
    }
  
    // Verificar si el placa existe
    const placa_exist = await Vehiculo.findOne({ placa });
    if (!placa_exist) {
      return res.status(200).json({result:"no_exist", message: 'placa no existe' });
    }else{
      return res.status(200).json({result:"found", message: 'placa existe' });
    }
  
  }
  
  exports.get_vehiculos = async(req, res, next) => {
    const { user_id } = req.body;
    console.log("buscando vehiculos de ", user_id)
   
    // Validar campos obligatorios
    if (!user_id) {
      console.log("no exist")
      return res.status(400).json({ message: 'user id es requeridos' });
    }
  
    // buscar vehiculos de usuario
    const vehiculos_exist = await Vehiculo.find({ user_id });
    if (!vehiculos_exist) {
      return res.status(200).json({result:"no_exist", message: 'No tiene vehiculos' });
    }else{
      return res.status(200).json({result:"found",vehiculo: vehiculos_exist });
    }
  
  }

  exports.setVehiculo = (req, res) =>{
    const { color, marca, modelo,placa,user,tipo } = req.body;
    
    console.log("Nuevo vehiculo",req.body)
    const vehiculoI = new Vehiculo({color, marca, modelo,placa,user,tipo}); 
  
    vehiculoI.save() 
      .then(result => console.log(result) ) 
      .catch(err => console.log(err.message)); 
  
    }; 
  

    

    exports.aprobarsolicitud = async (req, res) => {
      try {
        const solUpdate = await Solicitud.findByIdAndUpdate(
          req.body.solicitud,
          {estado:"APROVED",fecha_aprobacion:new Date()},
          { new: true }
        );
       // res.status(200).json(solUpdate);
      } catch (error) {
       // res.status(500).json({ message: error.message });
      }
    
      const { color, marca, modelo,placa,tipoVehiculo } = req.body.solicitud.vehiculo.data;
    
    console.log("Nuevo vehiculo",req.body)
    const vehiculoI = new Vehiculo(
      {
        color, 
        marca, 
        modelo,
        placa,
        user:req.body.solicitud.user_id,
        tipoVehiculo,
        tecnico_mecanica_vence:req.body.fecha_tecnicomecanica,
        soat_vence:req.body.fecha_soat
      }
      ); 
  
    vehiculoI.save() 
      .then(result => console.log(result) ) 
      .catch(err => console.log(err.message)); 
  
    }