//SCHEMA for CADET model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cadetSchema = new Schema({
	CIN: Number,
	Rank: Number,
	LastName: String,
	FirstName: String,
	OrgGroup: Number,
	TrgGroup: Number
});



module.exports = cadetSchema;