var bcrypt = require('bcrypt-nodejs');
var User = require('./user.js');
var Unit = require('./unit.js');
var Rank = require('./rank.js')

var DatabaseSync = function() {

this.getRanks = function(){
     Rank.find(function(err,results){
        if(err) return console.log(err);
        return results;
     })
}

};


module.exports = new DatabaseSync();