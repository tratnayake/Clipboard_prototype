var User = require('../models/user.js');
var Unit = require('../models/unit.js');
var Attendance = require('../models/attendance.js');
var Rank = require('../models/rank.js');


var Database = function() {};

//get from any table a certain quality
Database.prototype.getUnitID = function(UUID,callback){
	console.log("UUID is"+UUID);
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


Database.prototype.getUnitCadets = function(unitID,callback){
	 Unit.findOne({unitID:unitID},function(err,unit){
	    callback(null,unit.cadets,unit.orgGroups);
	  })
}

Database.prototype.signInCadet = function(attendanceID,CIN,attendanceLocation,callback){
	console.log("attendanceID is" +attendanceID);
	Attendance.findOne({_id:attendanceID},function(err,attendance){
		if(err) callback(null);

			//check if cadet already exists
			var exists = false;
			for (var i = 0; i < attendance.cadets.length; i++) {
				if(attendance.cadets[i].CIN == CIN){
					 exists = true;
				}
			};

		if (exists != true){	
		var timeStamp = new Date();
		var attendanceCadet = new Object({CIN:CIN,attendanceLocation:attendanceLocation,timeIn:timeStamp});
		 attendance.cadets.push(attendanceCadet);
		attendance.save();
		callback(null,"SIGNINSUCCESS");
		}
		else{
			callback(null,"SIGNINDUPLICATE");
		}
	})
}

Database.prototype.getUnitCadetsByUUID


module.exports = new Database();
