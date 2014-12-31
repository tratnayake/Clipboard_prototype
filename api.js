var bcrypt = require('bcrypt-nodejs');
var User = require('./models/user.js');
var Unit = require('./models/unit.js');
var mongoose = require('mongoose');
var db = mongoose.connection;



var api = function() {};

api.prototype.getUnits = function(req,res){
    //the 1 and 0 indicate only get the Unit ID's and not the object ID's
    return Unit.find({},{'_id':0},function(err,results){
        if(err){
            console.log(err);
        }
        for(i = 0; i < results.length; i++){
			console.log(results[i].unitID);
        }
        res.send(results);
    })
}

api.prototype.getUnitsTwo = function(req, res){
	return Unit.find().distinct('unitID', function(err, results){
		if(err){
			console.log(err);
		}
		res.send(results);
	})
}

api.prototype.purgeUnitTable = function(req,res){
    console.log("Purge Unit Table invoked");
    //console.log(req.signedCookies);
    console.log(req.session);

    var unitNum = req.session.user.unitID;
    console.log(unitNum);
    var dbName = unitNum+"cadets";
    console.log(dbName);
    console.log("Deleting database");

    Unit.findOne({unitID:unitNum},function(err,doc){
        if(err) return console.log(err);
        console.log(doc.cadets);
        console.log("length is" + doc.cadets.length);
        var length = doc.cadets.length;
        var i = doc.cadets.length;
            while (i--) {
              var cadet = doc.cadets[i];
              if (doc.cadets[i]) {
                doc.cadets.remove(cadet); // or just task.remove()
              }
            }
        doc.save();

        //var length = doc.ranks.length;
        var x = doc.orgGroups.length;
            while (x--) {
              var orgGroup = doc.orgGroups[x];
              if (doc.orgGroups[x]) {
                doc.orgGroups.remove(orgGroup); // or just task.remove()
              }
            }
        doc.save();
        console.log("DB Dropped");
        res.end('{"success" : "DB collection dropped succesfully", "status" : 200  }');  
    })
    

  
    
    
}


module.exports = new api();