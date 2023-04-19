var express = require('express');
var router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const MovieModel = require('../models/movies');
const passport = require('passport');

const MONGO_URL = process.env.MONGO_DB_URL

const client = new MongoClient(MONGO_URL);

async function run() {
  await client.connect();
  return 'Connected to the MongoDB server...';
}

run()
.then(console.log)
.catch(console.error);

/* GET home page. */
router.get('/movies',  passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  try {
    const movies = await MovieModel.find();
    console.log("VK result" +JSON.stringify(movies))
    res.json(movies);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

/* GET Movies. */
router.get('/movies/:uuid',  passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  try {
    const movieInfo = await MovieModel.findById(req.params.uuid).exec();
    if(movieInfo){
      console.log("Movie Info" + JSON.stringify(movieInfo));
      res.json(movieInfo);
    }
    
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

module.exports = router;
