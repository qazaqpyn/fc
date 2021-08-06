var express = require('express');
var router = express.Router();

let auth_controller = require('../controllers/authController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user: req.user });
});

// get and post requests for sign up
router.get('/sign-up', auth_controller.sign_up_get);
router.post('/sign-up',auth_controller.sign_up_post);


//get and post requests for sign in
router.get('/sign-in', auth_controller.sign_in_get);
router.post('/sign-in', auth_controller.sign_in_post);

router.get('/log-out', auth_controller.log_out_get);

router.post('/join-club',auth_controller.join_club_post);

module.exports = router;
