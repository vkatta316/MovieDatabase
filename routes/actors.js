var express = require('express');
var router = express.Router();

let data = [];

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('actors', {title: 'Movie Database'});
});

router.get('/actors/:id', function(req, res, next) {
  //Find the actor object with this :id
  //Respond to the client
});

router.get('/actors/:id/movies', function(req, res, next) {
  //Find all movies the actor with this :id is in
  //Respond to the client
});


router.post('/actors', function(req, res, next) {
   //Save new actor
   //Respond to the client
});


router.put('/actors/:id', function(req, res) {
  //Find and update the actor with this :id
  //Respond to the client
});

router.delete('/actors/:id', function(req, res) {
  //Remove the actor with this :id
  //Respond to the client
});


module.exports = router;
