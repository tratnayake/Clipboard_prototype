var express = require('express');
var router = express.Router();
var User = require('../models/user.js');

/* GET home page. */
router.get('/', function(req, res) {
  
  res.render('index', { title: 'Express' });

});

router.get('/users', function(req, res) {
	//Check if the user is authenticated and allowed to attend.
	console.log("the value of the signed cookies.auth is "+req.signedCookies.auth);

	if(req.signedCookies.auth !="pass"){
		return res.render('login',{title: 'Login', errorMessage: "You must be logged in and have the proper credentials to access that page."})
	}
	//Get all from DB
var UsersData;
	User.find(function (err, Users){
		if (err) return console.error(err);
		var UsersData = Users;
		console.log("UsersData is "+Users);
		  res.render('users', { title: 'Users', data: Users });

	});
console.log();	

});

/* GET Registration  page. */
router.get('/register', function(req, res) {
  res.render('register', { title: 'Register' });
});


/* GET login page. */
router.get('/login', function(req, res) {
  res.render('login', { title: 'Login', errorMessage: '' });
});




module.exports = router;
