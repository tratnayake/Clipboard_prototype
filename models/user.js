//SCHEMA for USER model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	emailAddress: String,
	passwordHash: String,
	firstName: String,
	lastName: String,
	unitID: Number,
	authLevel: Number,
	verified: Number
});


//Method to find unit by ID
//returns Unit Object
UserSchema.methods.getUserByID = function (userID,cb){
 this.model('User').findOne({_id: userID},cb);
}
module.exports = mongoose.model('User', UserSchema);