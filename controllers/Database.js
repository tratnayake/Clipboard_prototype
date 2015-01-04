var User = require('../models/user.js');
var Unit = require('../models/unit.js');
var Attendance = require('../models/attendance.js');
var Rank = require('../models/rank.js');


var Database = function() {};

//get from any table a certain quality
Database.prototype.getUnitID = function(UUID,callback){
    User.findOne({_id:UUID},function(err,doc){
          if(err){
            callback(err);
          }
          else{
            callback(null,doc.unitID);
          }
       })
 }

 Database.prototype.checkAttendanceActive = function(unitID,callback){
 	
 	var currentDate = new Date();
 	console.log("CurrentDate is "+currentDate);
 	var query = Attendance.find({unitID:unitID}).where('startDateTime').lte(currentDate).where('endDateTime').gte(currentDate);
 	
 	query.exec(function(err,data){
 		if(err) return console.log(err);
 		console.log("Inside DB"+data);
 		callback(null,data);
 	})
 			
 	//2. Query attendance table to see if there are any attendance sessions with start date < current date & < endDate
 	//3. 
 }


  Database.prototype.checkNextAttendance = function(unitID,limit,callback){
 	
 	var currentDate = new Date();
 	console.log("CurrentDate is "+currentDate);
 	var query = Attendance.find({unitID:unitID}).where('startDateTime').gte(currentDate).where('endDateTime').gte(currentDate);
 	
 	query.exec(function(err,data){
 		if(err) return console.log(err);
 		console.log(data);
 		callback(null,data);
 	})
 			
 	//2. Query attendance table to see if there are any attendance sessions with start date < current date & < endDate
 	//3. 
 }



module.exports = new Database();
