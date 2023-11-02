const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
const sharp = require('sharp');

const app = express();
const PORT = 6000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());

// Configuración de multer para almacenar los archivos en la carpeta "uploads/user_id"
var storagePhotos = multer.diskStorage({
  filename: (req, file, cb) => {
    console.log("file to save ",file);
    var filetype = '';
    if(file.mimetype === 'image/gif') {
      filetype = 'gif';
    }
    if(file.mimetype === 'image/png') {
      filetype = 'png';
    }
    if(file.mimetype === 'image/jpeg') {
      filetype = 'jpg';
    }

    var userId = file.originalname.split('-');
    
    var userIdn = userId[1].split('.');
    console.log("uid ",userIdn[0])
    
    const uploadDir = path.join(__dirname, `uploads/${userIdn[0]}`);
    
    fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, 'profile-' + new Date().toISOString() + '.' + filetype);
  }
});

var uploadPhoto = multer({storage: storagePhotos})


app.post('/uploadfiles', uploadPhoto.single('file'), (req, res) => {
	var _uid = req.body.uid;
	var file = req.file;
  console.log(file)
    if(file) {
      var userId = file.originalname.split('-');
      
      var userIdn = userId[1].split('.');
      console.log("user fl ",userIdn)

			sharp(file.path).resize(300,300).toFile('./uploads/'+userIdn[0]+'/300x300-'+file.originalname,function(err){
				if(err){
					console.log('sharp>>>',err);
				}
				else{
					console.log('resize ok !');
          res.json({result:"SUCCESS", message: 'Archivo subido correctamente' });
				}
			})
    }
    else throw 'error';
});

app.listen(PORT, () => {
  console.log(`Servidor uploads iniciado en el puerto ${PORT}`);
});
