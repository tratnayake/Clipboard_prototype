var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var Controller = require('../node_modules/controller')
var cookieParser = require('../node_modules/cookie-parser');
var api = require('../node_modules/api');

/* GET home page. */
router.get('/', function(req, res) {
  
  Controller.render(req,'index',null,res);

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
  Controller.render(req,'register',null,res);
});


/* GET login page. */
router.get('/login', function(req, res) {
  res.render('login', { title: 'Login', errorMessage: '' });
});

/* GET test page. */
router.get('/test', function(req, res) {
 Controller.render(req,'test',null,res);
});

router.get('/logout', function(req,res){
	Controller.logout(req,res);
})

router.get('/api/getUnits', function(req,res){
	api.getUnits(req,res);
})



module.exports = router;
