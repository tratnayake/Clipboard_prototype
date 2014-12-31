//SCHEMA for UNIT model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CadetSchema = require('../schemas/cadet');

var orgGroupSchema = new Schema({
	number: Number,
	name: String
})

var UnitSchema = new Schema({
	unitID: Number,
	unitName: String,
	// 1 = AIR, 2= ARMY, 3=SEA
	unitType: Number,
	//0 = Not verified, 1 = Verified, 2= inactive
	unitStatus: Number,
	unitDB: String,
	orgGroups: [orgGroupSchema],
	cadets:[CadetSchema]
});



//Method to find unit by ID
//returns Unit Object
UnitSchema.methods.getUnit = function (unitID,cb){
 this.model('Unit').findOne({unitID: unitID},cb);
}



module.exports = mongoose.model('Unit', UnitSchema);