var Unit = require('../models/unit.js')
var User = require('../models/user.js')
var Controller = require('controller');

var UnitController = function() {

	//Grab unit info and pass along to page
	this.manageUnit = function(req,res){
		console.log("MANAGE UNIT INVOKED!");
		var userID = req.session._id;

		console.log("userID is "+userID);

		var userObj = new User();
		userObj.getUserByID(userID,function(err,result){
			console.log(result.unitID);
			 var userResultID = result.unitID;

				var TestUnit = new Unit();
				TestUnit.getUnit(userResultID, function(err,unitResult){
					Controller.render(req,'manageUnit',unitResult,res);
				})

		})
		
			


	}

	this.importCadets = function(req,res){

		Controller.render(req,'importCadets',null,res);
	}
}



module.exports = new UnitController();