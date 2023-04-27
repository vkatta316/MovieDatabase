var express = require('express');
var router = express.Router();
const Movie = require('../src/Movie')
const fs = require('node:fs');
var path = require('path');
const { validationResult } = require('express-validator');

const MovieModel = require('../models/movies');

/* GET home page. */
exports.movies_list = async function (req, res, next) {
  const movies = await MovieModel.find();
  if (req.isAuthenticated()) {
    console.log(req.session);
    console.log(req.authInfo);
    console.log("Passport User On Movies" + JSON.stringify(req.session.passport.user.roles, null, 2));
    req.session.passport.user.roles.forEach(role => {
      if (role === 'admin' || role === 'editor') {
        console.log("MONGO  DB " + movies);
        res.render('movies', { title: 'Movie Database', action: 'Add A Movie', user: req.user.name, movies: movies });
      }
    });
    console.log("MONGO  DB " + movies);
    res.render('movies', { title: 'Movie Database', user: req.user.name, movies: movies });
  } else {
    res.render('movies', { title: 'Movie Database', movies: movies });
    //res.redirect('/login');
  }
};

/* GET Movie page. */
exports.movies_create_get = function (req, res, next) {
  console.log("User Create Movies" + JSON.stringify(req.session.passport.user.roles, null, 2));
  res.render('movie_add', { heading: 'Create a New Movie' });
};

/* POST Movies */
exports.movies_create_post =
  async function (req, res, next) {
    let originalFileName;
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
    const result = validationResult(req)
    if (!result.isEmpty()) {
      res.render('movie_add', { heading: 'Create a New Movie', msg: result.array() });
    } else {
      const newMovie = new MovieModel({
        title: req.body.movieTitle,
        year: req.body.year,
        synopsis: req.body.synopsis,
        rating: req.body.rating,
        ImageURL: `/images/${originalFileName}`,
        Featured: true
      });
      await newMovie.save();
      res.redirect('/movies')
    };
  };

/* GET Single Movie. */
exports.movies_details_get = async function (req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.session);
    console.log(req.authInfo);
    console.log("Passport User On Edit" + JSON.stringify(req.session.passport.user.roles, null, 2));
    const movieInfo = await MovieModel.findById(req.params.uuid).exec();
    req.session.passport.user.roles.forEach(role => {
      if (movieInfo && role === 'admin' || role === 'editor') {
        console.log("MOVIE INFO " + movieInfo);
        res.render('movie', { title: 'View Movie Details', editAction: 'Edit A Movie', deleteAction: 'Delete', movie: movieInfo });
      }
    });
    res.render('movie', { title: 'View Movie Details', movie: movieInfo });
  } else {
    res.redirect('/login');
  }
};

/* Delete Contact. */
exports.movies_delete_get = async function (req, res, next) {
  const movieInfo = await MovieModel.findById(req.params.uuid).exec();
  res.render('movie_delete', { title: 'Delete a Movie', heading: 'Delete a New Movie', movie: movieInfo });
};

/* Confirm Delete Contact. */
exports.movies_delete_post = async function (req, res, next) {
  await MovieModel.findByIdAndDelete(req.params.uuid);
  res.redirect('/movies');
};


/* GET edit todo form. */
exports.movies_edit_get = async function (req, res, next) {
  // const todo = await todosRepo.findById(req.params.uuid);
  const movieInfo = await MovieModel.findById(req.params.uuid).exec();
  res.render('movies_edit', { title: 'Edit Movie', movie: movieInfo });
};

/* POST edit todo. */
exports.movies_edit_post = async function (req, res, next) {
  console.log(req.body);
  const result = validationResult(req)
  console.log('result VVV' + result);
  if (!result.isEmpty()) {
    console.log('result VVV[]' + result.array());
    const movieInfo = await MovieModel.findById(req.params.uuid).exec();
    res.render('movies_edit', { title: 'Edit Movie', msg: result.array(), movie: movieInfo });
  } else {
    console.log("req.body.title" + req.body.movieTitle);
    await MovieModel.findByIdAndUpdate(req.params.uuid, { title: req.body.movieTitle, year: req.body.year, synopsis: req.body.synopsis, rating: req.body.rating });
    res.redirect(`/movies/${req.params.uuid}`);
  }
};