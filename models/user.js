var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	emailAddress: String,
	passwordHash: String,
	firstName: String,
	lastName: String,
	unitID: Number
});

module.exports = mongoose.model('User', UserSchema);