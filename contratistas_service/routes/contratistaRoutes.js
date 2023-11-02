const express = require('express'); 
const router = express.Router(); 
const contratistasController = require('../controllers/contratistasController'); 


router.post('/setsolicitud', contratistasController.setSolicitud); 
router.post('/getsolicitud', contratistasController.getsolicitud); 
router.post('/aprobarsolicitud', contratistasController.aprobarsolicitud); 
router.post('/getvehiculo', contratistasController.get_vehiculos); 
router.post('/setvehiculo', contratistasController.setVehiculo);
router.post('/check_placa', contratistasController.check_placa);


router.get("/",(req,res)=>{

    res.send({message:"welcome contratistas api"})
  })

router.get("/getsolicitudes",contratistasController.getsolicitudes)


module.exports = router; 
