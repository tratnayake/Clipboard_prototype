var Unit = require('./models/unit.js');
var User = require('./models/user.js');
var Rank = require('./models/rank.js');


var firstRun = function() {};

firstRun.prototype.populateTestUnits = function(){

    Unit.count(function(err,results){
      
      if(results < 1){
        console.log("units table empty, populating fake units")
        var testUnit = new Unit({ unitID:999, unitName:"TEST", unitType: 1, unitStatus: 1, unitDB: "999cadets"});
            testUnit.save(function(err,testUnit,numberAffected){
                if (err) return console.log(error);
                console.log("999 added to db");
            })
            var testUnit2 = new Unit({ unitID:6666, unitName:"Hells-Gate", unitType: 2, unitStatus: 1, unitDB: "6666cadets"});
            testUnit2.save(function(err,testUnit,numberAffected){
                if (err) return console.log(error);
                console.log("6666 added to db");
            })
        } else{
             console.log("DB Units collection not empty, no need to populate");
        }
        

    });
}

firstRun.prototype.populateRanks = function(){

    //FIRST RUN CHECK : If Ranks are empty, add the ranks
    Rank.count(function(err,results){
        if(err) return console.log(err);
        if(results < 1){
            //START POPULATING RANKS
            console.log("Ranks table is empty, populating ranks");

            console.log("Starting with AIR ranks")
            var airCadetRanks = ["AirCadet","Leading Air Cadet","Corporal","Flight Corporal","Sergeant","Flight Sergeant", "Warrant Officer Second Class", "Warrant Officer First Class"];
            var airAcronyms = ["AC","LAC","Cpl","FCpl","Sgt","FSgt","WO2","WO1"];
            for (var i = 1; i < airCadetRanks.length+1; i++) {
                 console.log("Rank "+i+"is "+airCadetRanks[i-1] +"with acronym "+airAcronyms[i-1]);
                 var tempRank = new Rank({rankElement: 1, rankNumber: i, rankName: airCadetRanks[i-1], rankShort: airAcronyms[i-1]});
                 tempRank.save(function(err,rank){
                    if(err) return console.log(err);
                    console.log(rank + "added to db");
                 })

            };


            console.log("Moving on to ARMY")
            var armyCadetRanks = ["Cadet","Lance Corporal","Corporal","Master Corporal","Sergeant","Warrant Officer", "Master Warrant Officer", "Chief Warrant Officer"];
            var armyAcronyms = ["Cdt","LCpl","Cpl","MCpl","Sgt","WO","MWO","CWO"];
            for (var i = 1; i < armyCadetRanks.length+1; i++) {
                 console.log("Rank "+i+"is "+armyCadetRanks[i-1] +"with acronym "+armyAcronyms[i-1]);
                 var tempRank = new Rank({rankElement: 2, rankNumber: i, rankName: armyCadetRanks[i-1], rankShort: armyAcronyms[i-1]});
                 tempRank.save(function(err,rank){
                    if(err) return console.log(err);
                    console.log(rank + "added to db");
                 })

            };

            var seaCadetRanks = ["Ordinary Seaman","Able Seaman","Leading Seaman","Master Seaman","Petty Officer Second Class","Petty Officer First Class", "Chief Petty Officer Second Class", "Chief Petty Officer Second Class"];
            var seaAcronyms = ["OS","AS","LS","MS","PO2","PO1","CPO2","CPO1"];
            for (var i = 1; i < seaCadetRanks.length+1; i++) {
                 console.log("Rank "+i+"is "+seaCadetRanks[i-1] +"with acronym "+seaAcronyms[i-1]);
                 var tempRank = new Rank({rankElement: 3, rankNumber: i, rankName: seaCadetRanks[i-1], rankShort: seaAcronyms[i-1]});
                 tempRank.save(function(err,rank){
                    if(err) return console.log(err);
                    console.log(rank + "added to db");
                 })

            };




        }
    })

}

module.exports = new firstRun();