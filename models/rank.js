//SCHEMA for RANKS model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RankSchema = new Schema({
	//1 = Air, 2 = Army, 3 = Sea
	rankElement: Number,
	//1,2,3,4,5,6,7
	rankNumber: Number,
	rankName: String,
	rankShort: String,

});

RankSchema.methods.getRankNum = function (rank){
 this.model('Rank').findOne({rankName: rank});
 return "bla";
}


module.exports = mongoose.model('Rank', RankSchema);