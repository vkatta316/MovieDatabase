var express = require('express');
var router = express.Router();
const Movie = require('../src/Movie')
const multer = require('multer');
const upload = multer({dest: 'tmp/'});
const MovieModel = require('../models/movies');
const moviesController = require('../controller/moviesController.js');
const { body } = require('express-validator');


/* GET all Movies listing. */
router.get('/', moviesController.movies_list);

/* Create a Movie Form listing. */
router.get('/add', moviesController.movies_create_get);

/* Render Data to Mongo*/
router.post('/add', upload.array('userFiles'), 
body('movieTitle').trim().notEmpty().withMessage('Movie Title cannot be empty') ,
body('year').trim().notEmpty().withMessage('Release cannot be empty') ,
body('rating').trim().notEmpty().withMessage('Rating cannot be empty') ,
moviesController.movies_create_post);

/* GET Single Movie Info. */
router.get('/:uuid', moviesController.movies_details_get);

/* Delete Movie. */
router.get('/:uuid/delete', moviesController.movies_delete_get);

/* Confirm Delete Movie. */
router.post('/:uuid/delete', moviesController.movies_delete_post);

/* GET edit todo form. */
router.get('/:uuid/edit', moviesController.movies_edit_get);

/* POST edit todo. */
router.post('/:uuid/edit',
body('movieTitle').trim().notEmpty().withMessage('Movie Title cannot be empty') ,
body('year').trim().notEmpty().withMessage('Release cannot be empty') ,
body('rating').trim().notEmpty().withMessage('Rating cannot be empty') ,
 moviesController.movies_edit_post);

module.exports = router;
