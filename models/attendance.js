//SCHEMA for Attendance model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var attendanceSchema = new Schema({
	unitID: String,
	startDateTime: Date,
	endDateTime: Date,
	cadets: [Number],
	cadetsExcused:[{CIN:String,Excuse:String}]
});





module.exports = mongoose.model('Attendance', attendanceSchema);