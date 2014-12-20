var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UnitSchema = new Schema({
	unitID: Number,
	unitName: String
});


module.exports = mongoose.model('Unit', UnitSchema);