var express = require('express');
var router = express.Router();
const ActorModel = require('../models/actors');
const MovieModel = require('../models/movies');

let data = [
  {text: 'This is movie 1', id:'123'},
  {text: 'This is movie 2', id:'1223'}
];

/* GET users listing. */
router.get('/', function(req, res, next) {
  //const data =[]
  res.render('movies', {title: 'Movie Database', movies: data});
});

router.get('/add', function(req, res, next) {
  //Find the movie object with this :id
  //Respond to the client
  res.render('movie_add', {title: 'Movie Database', movies: data});
});


router.post('/add', function(req, res, next) {
   //Save new actor
   //Respond to the client
   console.log(req.body);
   if(req.body.movieTitle.trim() === ''){
    res.render('movie_add', {title: 'Movie Database', msg: 'movie cannot be empty'});
   }else{
      let movieTitle = req.body.movieTitle.trim();
      let date = req.body.date.trim();
      let synopsis = req.body.synopsis.trim();
      var movieInfo = {
        movieTitle, date, synopsis
    };
    const newMovie = new MovieModel({
      title: req.body.movieTitle
    })
    res.redirect('/movies')
   }
   
});


router.put('/movies/:id', function(req, res) {
  //Find and update the actor with this :id
  //Respond to the client
});

router.delete('/movies/:id', function(req, res) {
  //Remove the actor with this :id
  //Respond to the client
});


module.exports = router;
