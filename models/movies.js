const mongoose = require('mongoose');

let movieSchema = new mongoose.Schema({ 
    
    title: {
      type: String, 
      required: true
     }, 
     year: {
       type: Number, 
       required: true
     },
     synopsis: {
        type: String
    },
    ImageURL: String,
    Featured: Boolean
  });
  


module.exports = mongoose.model('Movie', movieSchema);