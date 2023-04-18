var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/movies', function(req, res, next) {
  if (req.isAuthenticated()) {
    console.log(req.session);
    console.log(req.authInfo);
    res.render('movies', { title: 'User Info', user: JSON.stringify(req.session.passport.user, null, 2) });
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
