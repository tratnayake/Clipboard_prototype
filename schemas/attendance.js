//SCHEMA for CADET model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Cadet = require('../schemas/cadet.js');

var attendanceSchema = new Schema({
	startDateTime: Date,
	endDateTime: Date,
	CIN: [Number]
});



module.exports = attendanceSchema;