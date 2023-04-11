var express = require('express');
var router = express.Router();
const Movie = require('../src/Movie')

const MovieModel = require('../models/movies');

/* GET home page. */
exports.movies_list = async function(req, res, next) {
    const movies = await MovieModel.find();
    console.log("MONGO  DB " + movies);
    res.render('movies', {title: 'Movie Database', movies: movies});
  };

 /* GET Movie page. */
 exports.movies_create_get = function(req, res, next) {
  res.render('movie_add', { heading: 'Create a New Movie'});
};

/* POST Movies */
exports.movies_create_post = 
async function(req, res, next) {
  //Save new actor
  //Respond to the client
  console.log(req.body);
 console.log(req.userFiles);
  if(req.body.movieTitle.trim() === ''){
   res.render('movie_add', {title: 'Movie Database', msg: 'movie cannot be empty'});
  }else{
     let movieTitle = req.body.movieTitle.trim();
     let year = req.body.year.trim();
     let synopsis = req.body.synopsis.trim();
     let imageURL = req.body.userFiles;
     var movieInfo = {
       movieTitle, year, synopsis, imageURL
   };
   //const newMovie = new Movie('', movieInfo );
   const newMovie = new MovieModel({
     title: req.body.movieTitle,
     year: req.body.year,
     synopsis: req.body.synopsis,
     ImageURL: req.body.userFiles,
     Featured: true
   });
   await newMovie.save();
   res.redirect('/movies')
  }
  
};

/* GET Single Movie. */
exports.movies_details_get = async function(req, res, next) {
  const movieInfo = await MovieModel.findById(req.params.uuid).exec();
  if(movieInfo){
    console.log("Movie Info" +movieInfo)
    res.render('movie', { title: 'View Movie Details', movie: movieInfo});
  }else{
    res.redirect('/movies')
  }
 
};