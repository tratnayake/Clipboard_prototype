var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	emailAddress: String,
	passwordHash: String,
	firstName: String,
	lastName: String
});

module.exports = mongoose.model('User', UserSchema);