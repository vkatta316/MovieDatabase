const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let userSchema = new mongoose.Schema({ 
    name: {
        type: String
      },
      email: {
        type: String,
        unique: true,
        required: true
      },
      password: {
        type: String
      },
      refreshToken: String,

});

userSchema.pre('save', async function(next) {
    try {
      const user = this;
      // Only hash if the password has been modified or is new.
      if (!user.isModified('password')) return next();
      // Generate salt
      const salt = await bcrypt.genSalt(10);
      // Hash the password with the new salt
      const hashedPassword = await bcrypt.hash(this.password, salt);
      // Replace the cleartext password with the hashed one
      user.password = hashedPassword;
      next();
    } catch (error) {
      return next(error);
    }
  });
  
  userSchema.methods.matchPassword = async function(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw new Error(error);
    }
  };

module.exports = mongoose.model('User', userSchema);