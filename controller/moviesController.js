var express = require('express');
var router = express.Router();
const Movie = require('../src/Movie')
const fs = require('node:fs');
var path = require('path');
const {validationResult} = require('express-validator');

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
  let originalFileName ;
  
  //Save new actor
  //Respond to the client
  console.log(req.body);
  console.log(req.files);
  if (req.files.length > 0) {
    req.files.forEach(f => {
      originalFileName = f.originalname;
      //path.join(path.dirname(`${f.path}`, '/src/public/images/') + originalFileName
      fs.renameSync(`${f.path}`, `./public/images/${originalFileName}`);
    });
  }
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
     
     ImageURL: `/images/${originalFileName}`,
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

/* Delete Contact. */
exports.movies_delete_get =  async function(req, res, next) {
  const movieInfo = await MovieModel.findById(req.params.uuid).exec();
  res.render('movie_delete', { heading: 'Delete a New Movie', movie: movieInfo });
};

/* Confirm Delete Contact. */
exports.movies_delete_post =  async function(req, res, next) {
 await MovieModel.findByIdAndDelete(req.params.uuid);
  res.redirect('/movies');
};

 
  /* Edit Movie page. */
  exports.movies_edit_get =  async function(req, res, next) {
    const movieInfo = await MovieModel.findById(req.params.uuid).exec();
    console.log('Edit Movie page' + movieInfo);
    res.render('movie_edit', { heading: 'Edit a Movie' , movie: movieInfo });
  };
  
  /* POST Edit Movie page. */
  exports.movies_edit_post = 
  async function(req, res, next) {
    const result = validationResult(req)
    if(!result.isEmpty()){
      const movieInfo = await MovieModel.findById(req.params.uuid).exec();
      res.render('movie_edit' , {heading : 'Edit a Movie' , msg : result.array() , movie: movieInfo});
    }
    else{


    const filter = { name: 'Pulp Fiction'};

    
    const update = { year: 2005 };

    

    // `doc` is the document _before_ `update` was applied
    let doc = await MovieModel.findOneAndUpdate(filter, update,  {
      new: true
    });
    
    
    
      console.log("reult" +doc)
      res.redirect(`/movies/${req.params.uuid}`);
    }
};