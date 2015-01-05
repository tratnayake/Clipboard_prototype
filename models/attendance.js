//SCHEMA for Attendance model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cadetAttendanceSchema = new Schema({
	CIN: String,
	attendanceLocation: Number,
	timeIn: Date
})

var excusedCadetSchema = new Schema({
	CIN: String,
	excuse: String,
})

var attendanceSchema = new Schema({
	unitID: String,
	startDateTime: Date,
	endDateTime: Date,
	cadets: [cadetAttendanceSchema],
	excusedCadets: [excusedCadetSchema],
	absentCadets: [Number]
});





module.exports = mongoose.model('Attendance', attendanceSchema);