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



module.exports = new Database();
