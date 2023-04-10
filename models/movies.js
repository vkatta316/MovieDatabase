const mongoose = require('mongoose')

const moviesSchema = new mongoose.Schema({
    id:{
        type: Number,
        required: true,
        index: {
            unique:true
        }
    },
    title: {
        type: String,
        required: true
    },

    year: {
        type: Number, 
        required: true
      }, 

    actors: [{
        type : mongoose.Schema.ObjectId, 
        ref : 'Actor'
    }]

});

module.exports = mongoose.model('Movie', moviesSchema);