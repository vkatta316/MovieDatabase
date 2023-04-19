var express = require('express');
var router = express.Router();



/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.session);
    console.log(req.authInfo);
    console.log("Passport User" +JSON.stringify(req.session.passport.user, null, 2));
    res.render('users', { title: 'User Info', user: req.user.displayName });
  } else {
    res.redirect('/login');
  }
});


module.exports = router;
