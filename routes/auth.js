var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('../models/users');
var GoogleStrategy = require('passport-google-oidc');
var FederatedCredentials = require('../models/FederatedCredentials');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;


const jwtAccessSecret = "This is my JWT access secret, it should be in a .env file!";
const jwtRefreshSecret = "This is my JWT refresh secret, it should be different than the access secret and in a .env file!";

async function localAuthUser(email, password, done) {
  try {
    const aUser = await User.findOne({ email: email });
    if (!aUser) {
      return done(null, false);
    }
    const isMatch = await aUser.matchPassword(password);
    if (!isMatch) {
      return done(null, false);
    }
    return done(null, aUser);
  } catch (error) {
    console.log(error);
    return done(error, false);
  }
}

async function googleAuthUser(issuer, profile, done) {
  return done(null, profile);
}

passport.use(new LocalStrategy({
  nameField: 'name',
  usernameField: 'email',
  passwordField: 'password'
}, localAuthUser));


async function googleAuthUser(issuer, profile, done) {
  //return done(null, profile);
  try {
    const fedCred = await FederatedCredentials.findOne({provider: issuer, subject: profile.id});
    if (!fedCred) {
      // Create new user
      const newUser = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
      });
      const savedNewUser = await newUser.save();

      console.log("SAVED USER" +savedNewUser);
      // Create new federated credentials
      const newFedCred = new FederatedCredentials({
        provider: issuer,
        subject: profile.id,
        userid: savedNewUser.id,
        name: savedNewUser.name,
      });
      const savedDoc = await newFedCred.save();
      return done(null, savedNewUser);
    } else {
      const aUser = await User.findById(fedCred.userid);
      return done(null, aUser);
    }
  } catch (error) {
    console.log(error);
    return done(error, false);
  }
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/oauth2/redirect/google',
  scope: ['profile', 'email'],
}, googleAuthUser));

const jwt_opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
  secretOrKey: jwtAccessSecret,
};


passport.use('jwt', new JwtStrategy(jwt_opts, async function (jwt_payload, done) {
  try {
    const aUser = await User.findOne({ email: jwt_payload.email });
    if (aUser) {
      return done(null, aUser);
    } else {
      return done(null, false);
    }
  } catch (error) {
    console.log(error);
    return done(error, false);
  }
}));


passport.serializeUser(function (user, done) {
  done(null, {id: user.id, roles: user.roles, name: user.name});
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

/* GET home page. */
router.get('/login', function (req, res, next) {
  res.render('login');
});

/* POST local login. */
router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/movies',
  failureRedirect: '/login',
}));


/* POST logout. */
router.post('/logout', function (req, res, next) {
  req.logout(function (error) {
    if (error) { return next(error); }
    res.redirect('/login');
  });
});

/* GET signup form. */
router.get('/signup', function (req, res, next) {
  res.render('signup');
});

/* POST Signup form. */
router.post('/signup', async function (req, res, next) {
  try {
    let newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    let savedDoc = await newUser.save();
    req.login(savedDoc, function (err) {
      if (err) { return next(err); }
      return res.redirect('/movies');
    });
  } catch (error) {
    return next(error);
  }
});

/* GET google login. */
router.get('/login/federated/google', passport.authenticate('google'));

/* GET google redirect. */
router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/movies',
  failureRedirect: '/login',
}));

/* POST api login. */
router.post('/api/login', passport.authenticate('local', { session: false }), async function(req, res, next) {
  const cookies = req.cookies;
  const foundUser = await User.findOne({ email: req.user.email }).exec();

  const accessToken = jwt.sign({email: foundUser.email}, jwtAccessSecret, {
    expiresIn: "15m"
  });

  const refreshToken = jwt.sign({email: foundUser.email}, jwtRefreshSecret, {
    expiresIn: "1d"
  });

  let existingRefreshTokenArray = !cookies?.jwt ? foundUser.refreshToken : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);

  if (cookies?.jwt) {
    // old token reuse or no logout and tries to login again
    const cookieRefreshToken = cookies.jwt;
    const foundToken = await User.findOne({refreshToken: cookieRefreshToken}).exec();
    // old token reuse
    if (!foundToken) {
      existingRefreshTokenArray = [];
    }
    res.clearCookie('jwt', { 
      httpOnly: true, 
      sameSite: 'None', 
      //secure: true,
    });
  }

  foundUser.refreshToken = [refreshToken, ...existingRefreshTokenArray];
  const result = await foundUser.save();

  res.cookie('jwt', refreshToken, { 
    httpOnly: true, 
    sameSite: 'None', 
    //secure: true, 
    maxAge: 24 * 60 * 60 * 1000, //1 day
  });

  res.json({
    auth: true,
    accessToken,
    message: 'logged in'
  });
});

router.get('/api/refresh_token', async function(req, res, next) {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(401); //Unauthorized
  }
  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', { 
    httpOnly: true, 
    sameSite: 'None', 
    //secure: true,
  });
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    // Token reuse
    jwt.verify(refreshToken, jwtRefreshSecret, async function (err, decoded) {
      if (err) {
        return res.sendStatus(403); //Forbidden
      }
      const hackedUser = await User.findOne({email: decoded.email}).exec();
      hackedUser.refreshToken = [];
      const result = await hackedUser.save();
    });
    return res.sendStatus(403); //Forbidden
  }

  const refreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);

  jwt.verify(refreshToken, jwtRefreshSecret, async function (err, decoded){
    if (err) {
      // refresh token is expired
      foundUser.refreshToken = [...refreshTokenArray];
      const result = await foundUser.save();
    }

    if (err || foundUser.email !== decoded.email) {
      return res.sendStatus(403); //Forbidden
    }

    // refresh token is still valid
    const accessToken = jwt.sign({ email: foundUser.email }, jwtAccessSecret, { expiresIn: "15m" });
    
    const newRefreshToken = jwt.sign({ email: foundUser.email }, jwtRefreshSecret, { expiresIn: "1d" });

    foundUser.refreshToken = [...refreshTokenArray, newRefreshToken];
    const result = await foundUser.save();

    res.cookie('jwt', newRefreshToken, { 
      httpOnly: true, 
      sameSite: 'None', 
      //secure: true, 
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    res.json({
      auth: true,
      accessToken,
      message: 'access token refreshed'
    })
  });
});

router.get('/api/logout', async function (req, res, next) {
  // Delete accessToken on client also
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204); //No content
  }

  const refreshToken = cookies.jwt;

  // Is token in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      //secure: true,
    });
    return res.sendStatus(204);
  }

  // found token in db user delete
  foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);
  const result = await foundUser.save();
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'None',
    //secure: true,
  });
  res.sendStatus(204);
});

module.exports = router;