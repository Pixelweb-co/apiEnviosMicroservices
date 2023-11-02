const express = require('express'); 
const router = express.Router(); 
const ratingController = require('../controllers/ratingController'); 
router.post('/setrating', ratingController.setRating); 
router.get('/:userId', ratingController.getRatingsByUser); 
module.exports = router; 
