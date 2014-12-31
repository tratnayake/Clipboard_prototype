var express = require('express');
var router = express.Router();

var cookieParser = require('../node_modules/cookie-parser');
var api = require('../node_modules/api');


//MODELS:
var User = require('../models/user.js');
var Unit = require('../models/unit.js');
var Rank = require('../models/rank.js')

//CONTROLLERS:
var Controller = require('../controllers/Controller')

//authCheck function
function requireAuth(authLevel){
	console.log("REQUIRE AUTH");

	console.log("Reqd: "+authLevel);
	  return function(req, res, next) {
				console.log("HAS :"+JSON.stringify(req.session));	  	
        if(req.session.user && req.session.user.authLevel >= authLevel){
        	console.log("AUTH PASS @ ROUTER ");
        	next();
        }
            
        else{
        	console.log("AUTH FAIL @ ROUTER")
            res.render('login',{title: 'Login', errorMessage: "Access Denied"})
    }
}
}


/* GET home page. */
router.get('/', function(req, res) {
  
  Controller.render(req,'index',null,res);

});



//THIS IS A DEV FUNCTION. Hence, not using the controller. Only admins can 
//see a list of ALL users.
router.get('/users',requireAuth(9),function(req, res) {
	//Check if the user is authenticated and allowed to attend.
	
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
router.get('/units', requireAuth(9),function(req, res){




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
		var RanksData = Ranks;
		console.log("Ranks are " + RanksData);
		Controller.render(req, 'addCadets', RanksData, res);
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

router.get('/dashboard', requireAuth(1),function(req,res){
	console.log("Session is "+JSON.stringify(req.session));
	Controller.render(req,'dashboard',null,res);
})

router.get('/manageUnit', function(req,res){
	Controller.render(req,'manageUnit',null,res);
})

router.get('/importCadets',function(req,res){
	Controller.render(req,'importCadets',null,res);
})

router.get('/scheduleAttendance',requireAuth(1),function(req,res){
	Controller.render(req,'scheduleAttendance',null,res);
});

router.get('/manageAttendance',requireAuth(1),function(req,res){
	Controller.render(req,'manageAttendance',null,res);
})

router.get('/printBarcodes', requireAuth(1),function(req,res){
	Controller.render(req,'setBarcodes',null,res);
})


module.exports = router;
