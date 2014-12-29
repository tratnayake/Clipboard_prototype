//SCHEMA for Attendance model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var attendanceSchema = new Schema({
	unitID: String,
	startDateTime: Date,
	endDateTime: Date,
	cadets: [String]
});





module.exports = mongoose.model('Attendance', attendanceSchema);