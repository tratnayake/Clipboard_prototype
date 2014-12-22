//SCHEMA for UNIT model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UnitSchema = new Schema({
	unitID: Number,
	unitName: String,
	// 1 = AIR, 2= ARMY, 3=SEA
	unitType: Number,
	//0 = Not verified, 1 = Verified, 2= inactive
	unitStatus: Number
});


module.exports = mongoose.model('Unit', UnitSchema);