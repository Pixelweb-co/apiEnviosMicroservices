const Rating = require('../models/Rating'); 


exports.setRating = (req, res) =>{
  const { solicitud, tipo, user, calificacion } = req.body; 
  const rating = new Rating({ solicitud, tipo, user, calificacion }); 

  rating.save() 
    .then(result => console.log(result) ) 
    .catch(err => console.log(err.message)); 

  }; 


exports.getRatingsByUser = (req, res) =>{
  const userId = req.params.userId; 
  Rating.find({ user: userId }) 
    .then(ratings => console.log(ratings)) 
    .catch(err =>console.log(err.message)); 

}; 
