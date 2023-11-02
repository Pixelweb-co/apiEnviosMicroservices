
mkdir routes
echo const express = require('express'); > routes/ratingRoutes.js
echo const router = express.Router(); >> routes/ratingRoutes.js
echo const ratingController = require('../controllers/ratingController'); >> routes/ratingRoutes.js
echo router.post('/setrating', ratingController.setRating); >> routes/ratingRoutes.js
echo router.get('/:userId', ratingController.getRatingsByUser); >> routes/ratingRoutes.js
echo module.exports = router; >> routes/ratingRoutes.js

mkdir controllers
echo const Rating = require('../models/Rating'); > controllers/ratingController.js
echo exports.setRating = (req, res) => { >> controllers/ratingController.js
echo   const { solicitud, tipo, user, calificacion } = req.body; >> controllers/ratingController.js
echo   const rating = new Rating({ solicitud, tipo, user, calificacion }); >> controllers/ratingController.js
echo   rating.save() >> controllers/ratingController.js
echo     .then(result => res.status(201).json({ rating: result })) >> controllers/ratingController.js
echo     .catch(err => res.status(500).json({ message: err.message })); >> controllers/ratingController.js
echo }; >> controllers/ratingController.js
echo exports.getRatingsByUser = (req, res) => { >> controllers/ratingController.js
echo   const userId = req.params.userId; >> controllers/ratingController.js
echo   Rating.find({ user: userId }) >> controllers/ratingController.js
echo     .then(ratings => res.status(200).json({ ratings })) >> controllers/ratingController.js
echo     .catch(err => res.status(500).json({ message: err.message })); >> controllers/ratingController.js
echo }; >> controllers/ratingController.js


mkdir models
echo const mongoose = require('mongoose'); > models/Rating.js
echo const ratingSchema = new mongoose.Schema({ >> models/Rating.js
echo   solicitud: { type: String, required: true }, >> models/Rating.js
echo   tipo: { type: String, required: true }, >> models/Rating.js
echo   user: { type: String, required: true }, >> models/Rating.js
echo   calificacion: { type: Number, required: true } >> models/Rating.js
echo }); >> models/Rating.js
echo const Rating = mongoose.model('Rating', ratingSchema); >> models/Rating.js
echo module.exports = Rating; >> models/Rating.js

echo const express = require('express'); > index.js
echo const mongoose = require('mongoose'); >> index.js
echo const bodyParser = require('body-parser'); >> index.js
echo const ratingRoutes = require('./routes/ratingRoutes'); >> index.js
echo const app = express(); >> index.js
echo app.use(bodyParser.json()); >> index.js
echo app.use('/rating', ratingRoutes); >> index.js
echo mongoose.connect('mongodb://localhost:27017/ratings', { >> index.js
echo   useNewUrlParser: true, >> index.js
echo   useUnifiedTopology: true >> index.js
echo }) >> index.js
echo   .then(() => app.listen(3000, () => { >> index.js
echo     console.log('Servidor en ejecución en http://localhost:3000'); >> index.js
echo   })) >> index.js
echo   .catch(err => console.log('Error al conectar a la base de datos', err)); >> index.js

