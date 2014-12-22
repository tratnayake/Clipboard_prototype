var express = require('express');
var router = express.Router();
var Controller = require('../node_modules/controller')
var cookieParser = require('../node_modules/cookie-parser');
var api = require('../node_modules/api');

//MODELS:
var User = require('../models/user.js');
var Unit = require('../models/unit.js');
var Rank = require('../models/rank.js')

//CONTROLLERS:
var UnitController  = require('../controllers/UnitController');

/* GET home page. */
router.get('/', function(req, res) {
  
  Controller.render(req,'index',null,res);

});

//THIS IS A DEV FUNCTION. Hence, not using the controller. Only admins can 
//see a list of ALL users.
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
		  Controller.render(req,'Users',UsersData,res);

	});
console.log();	

});

//ALSO A DEV FUNCTION. See above
router.get('/units', function(req, res){

if(req.signedCookies.auth !="pass"){
		return res.render('login',{title: 'Login', errorMessage: "You must be logged in and have the proper credentials to access that page."})
	}


	//Get all from DB
var UnitsData;
	Unit.find(function (err, Units){
		if (err) return console.error(err);
		var UnitsData = Units;
		console.log("UnitsData is "+UnitsData);
		Controller.render(req,'Units',UnitsData,res);
		 

	});


})

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

/* GET addCadets page */
router.get('/addCadets',function(req, res){
	var RanksData;
	Rank.find(function(err, Ranks){
		if(err)
			console.error(err);
		var RanksData = Rank;
		console.log("RanksData is" + Ranks);
		Controller.render(req, 'addCadets', null, res);
	});
})

router.get('/logout', function(req,res){
	Controller.logout(req,res);
})

router.get('/api/getUnits', function(req,res){
	api.getUnitsTwo(req,res);
})

router.get('/welcome',function(req,res){
	Controller.render(req,'welcome',null,res);
})

router.get('/dashboard', function(req,res){
	Controller.render(req,'dashboard',null,res);
})

router.get('/manageUnit', function(req,res){
	UnitController.manageUnit(req,res);
})



module.exports = router;
