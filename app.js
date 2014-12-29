var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
//BCrypt module for hashing passwords
var bcrypt = require('bcrypt-nodejs');
//Custom ROUTER
var routes = require('./routes/index');
var users = require('./routes/users');
//MAIN CONTROLLER
var Controller = require('controller');
//required to read files. Need this to read the db pw
var fs = require('fs');
//required to handle file uploads
var multer = require('multer');
//Excel parsing
var converter = require("xls-to-json");  
var async = require('async');




var dbSync = require('./models/DatabaseSync.js')
//Models
var Unit = require('./models/unit.js');
var User = require('./models/user.js');
var Rank = require('./models/rank.js');

//Schemas
var cadetSchema = require('./schemas/cadet.js');
var attendanceSchema =require('./schemas/attendance.js');

var api = require('api');


var app = express();
//SOCKET IO STUFF
var server = require('http').Server(app);
var io = require('socket.io')(server);

var sockIOport= 80;
server.listen(sockIOport);
console.log("SocketIO listening on "+sockIOport);
// END SOCKET IO STUFF

app.use(multer({dest: './uploads/'}));

var routes = require('./routes/index');
var users = require('./routes/users');


// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//Sign cookies with 'OurSecret'
app.use(cookieParser('OurSecret'));

//Session stuff:
app.use(session({secret: 'OurSecret',  
                resave: false,
                saveUninitialized: true}));

//Mongoose stuff
var mongoose = require('mongoose');

app.listen();

//======================= DB STUFF ====//







//this is the contents of the dbpassword.txt file
var dbPassword = fs.readFileSync("dbpassword.txt");
mongoose.connect('mongodb://clipboard:doncheadle@ds029051.mongolab.com:29051/clipboarddb');


//On first run, test DB connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("DB connection successful");


  });

//FIRST RUN CHECK: If units collection is empty, add a fake unit to it.

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


//==============SOCKET.IO STUFF (TESTING?)=========================/

var allSockets = [];

io.on('connection', function(socket){
  //var test = socket;
  //var printTest = JSON.stringify(test)
  console.log('**CONNECTION*** from socket '+socket);
  socket.emit('firstReceipt', {message: "Connection handshake intitiated from "+socket});

  //When client sends over his/her UUID
  socket.on('registrationUUID',function(data){
    console.log("Registration UUID invoked, UUID is "+data.UUID);
    var socketID = {UUID: data.UUID,Socket: socket};
    console.log("Socket ID obj is "+socketID);
    allSockets.push(socketID);
    console.log("Socket added to array")
    console.log("Size of array is: "+allSockets.length)
    socket.emit('srvMsg',{message: "Thank you for completing the handshake. USER ___ has now been registered with socketIO"});
  })

  /////DASHBOARD STUFF
    socket.on("getUnitStats",function(data){
      console.log("**************getUnitStats invoked with data"+data);
      switch(data.command){
        case "unitStrength":
        console.log("unitStrength invoked");
        var UUID = getSocketUUID(allSockets,socket);
        console.log("UUID is"+UUID);
        User.findOne({_id:UUID},function(err,user){
          if(err) return console.log(err);
          //console.log(user);
          var unitID = user.unitID;
          
          Unit.findOne({unitID:unitID},function(err,doc){
            if(err) return console.log(err);
            //console.log(doc);
            var strength = doc.cadets.length;
            console.log("Strength is "+strength);
            socket.emit("getUnitStats",{message: "unitStrength", data:strength});
          })
          
        })

      }
    })

  //---SCHEDULE ATTENDANCE RELATED FUNCTIONS --
  socket.on('scheduleAttendance',function(data){

    var command = data.command;
    console.log("Command is "+command);

    switch(command){
      case "getUnitCadets":
        console.log("getUnitCadets invoked");
        console.log("socket is"+socket);
        var UUID = getSocketUUID(allSockets,socket);
        
        User.findOne({_id:UUID},function(err,doc){
          if(err) return console.log(err);
          console.log(doc);
          var unit = doc.unitID;
            async.waterfall([
              //Grab all Cadets
              function(callback){
                var dbName = unit+"cadets";
                  Unit.findOne({unitID:unit},function(err,doc){
                    if(err) return console.log(err);
                    var cadets = doc.cadets;
                    callback(null,cadets)
                  });
                  
                },
              
              //Grab org groups
              function(cadets,callback){
                Unit.findOne({unitID:unit},function(err,doc){
                  if(err) return console.log(err);
                  var orgGroups = doc.orgGroups;
                  callback(null,cadets,orgGroups);
                })
              }
              ],
              //send all data back
              function(err,cadets,orgGroups){
                if(err) return console.log(err);
                socket.emit("getUnitCadetsDATA",{Cadets: cadets, OrgGroups: orgGroups});
              })


          //socket.emit('getUnitCadets',{orgUnits: orgUnits, cadets: cadets});
        })
        
        break;
        case "reviewedList":
        console.log("Reviewed List invoked");
        console.log(data);
        //get Attendance Table


        var tempVar = data;
        console.log(tempVar);
        console.log(tempVar)

        var Attendance = mongoose.model("999attendance",attendanceSchema);

        var tempDate = tempVar.data.dateStart;
        console.log(tempDate);
        var date = tempDate.split('/');
        //mm/dd/yyyy
        var saveDate = new Date(date[2], date[0]-1, date[1]);
        var saveStartTime = convertTime(tempVar.data.timeStart);
        var saveEndTime = convertTime(tempVar.data.timeEnd);

        //yy/mm/dd/hh/mm/ss
       var saveStartDateTime = new Date(date[2], date[0]-1, date[1], saveStartTime[0],saveStartTime[1]);
       var saveEndDateTime = new Date(date[2], date[0]-1, date[1], saveEndTime[0],saveEndTime[1]);
       console.log("Attendnace Start "+saveStartDateTime);
       console.log("Attendnace End"+saveEndDateTime);

       var tempAttendance = new Attendance({ startDateTime : saveStartDateTime, endDateTime: saveEndDateTime});

       var tempSessionCadets = tempVar.data.sessionCadets;
       for (var i = 0; i < tempSessionCadets.length; i++) {
         tempAttendance.CIN.push(tempSessionCadets[i]);
         console.log(tempSessionCadets[i]+"added to temp object");

       };

       tempAttendance.save()
       console.log("Changes saved to db");
       
        
     

        socket.emit("scheduleAttendance",{message:"SUCCESS",data: tempVar});
        console.log("Success message sent back")
    }


  })

  //Happens when client disconnects
  socket.on('disconnect',function(data){
    console.log("DISCONNECT!");
    for (var i = 0; i < allSockets.length; i++) {
      if(allSockets[i].Socket == socket){
        console.log("matches!")
        allSockets.splice(i,1);
        console.log("removed from array, size now"+allSockets.length);
      }
    };
  })
})


//Socket HELPER functions
function getSocketUUID(socketsArray,socket){
  console.log("INside");
 
  for (var i = 0; i < socketsArray.length; i++) {
     //console.log(socketsArray[i]);
    console.log(i+"UUID is "+socketsArray[i].UUID);
    if(socketsArray[i].Socket == socket){
      console.log("MATCH!")
      return socketsArray[i].UUID;
    }
    else{
      console.log("NO MATCH!");
    }
  }
}

function getUnitID(UUID){
  User.findOne({_ID:UUID},function(err,doc){
    if(err) return console.log(err);
    return doc.unitID;
  })
}

function convertTime(time){
  var startTime = time.split(":");
        console.log("startTime"+startTime);
        var cycle = startTime[1].slice(-2);
        console.log("Start Time is "+startTime[0]);
        console.log("cycle is"+cycle);
        
        //hours
        if (cycle == "pm"){
          startTime[0] = Number(startTime[0]) + 12;
          console.log("PM so time is now"+startTime[0]);
        }

        //minutes
        
        startTime[1] = startTime[1].substring(0, startTime[1].length - 2)

        return startTime;
}

//============= /END SOCKET FUNCTIONS ============================//

////hold an array for all the sockets to be added onto when they connect.
//var allSockets = [];
////on connection, associate a userID;
//io.sockets.on('connection', function(socket) {
  //var userId = allSockets.push(socket);
  //console.log("The userID is "+userId);
  //socket.on('newChatMessage', function(message) {
   // console.log(data);
    //socket.broadcast.emit('newChatMessage_response', {data: message});
  //});
  //socket.on('privateChatMessage', function(message, toId) {
   // allSockets[toId-1].emit('newPrivateMessage_response', {data: message});
  //});
  //socket.broadcast.emit('newUserArrival', 'New user arrived with id of: ' + userId);
//});

//==============FIRST RUN TESTS BECAUSE I'm TOO LAZY TO COMPILE SHIT

//var filePath = (__dirname+'\\TestDataA.xls');
//ETLCadets(filePath,1);

//console.log("filePath is" + filePath);

//ETLCadetsNew(filePath,1,999);

function ETLCadetsExcel(filePath,rankElement,unitID,res){
  console.log("filePath is" +filePath);
  async.waterfall([
    //Extract all data from Excel File
    function(callback){
      console.log("Function 1 begin");
        converter({ input: filePath, output: null}, function(err, excelData) {
          if(err) return console.error(err);
             console.log(excelData);
             callback(null,excelData);
        })
   },
    //Grab the ranks for the selected element
    function(excelData,callback){
      console.log("Function 2 begin");
      //Query: Select rankNumber,rankShort from Ranks where rankElement = 1
      Rank.find({rankElement:rankElement}, 'rankNumber rankShort', function(err,rankData){
        console.log("RankData is "+rankData);
        callback(null,excelData,rankData);
      })
    },
    //Translate all the Rank NAMES for Numbers to store into db
    function(excelData,rankData,callback){
      for (var i = 0; i < excelData.length; i++) {
        var excelShortRank = excelData[i].Rank.toLowerCase();
          for (var j = 0; j < rankData.length; j++) {
            var transShortRank = rankData[j].rankShort.toLowerCase();
            if(excelShortRank == transShortRank){
              excelData[i].rankNum = rankData[j].rankNumber;
            }
          };
      };
      console.log("Rank Translated Data is");
      for (var k = 0; k < excelData.length; k++) {
        console.log(excelData[k]);
      };
      callback(null,excelData);
    },
    //A) Get all the unique org groups, B) Then save into DB.
    function(excelData,callback){
      //A)
      var allOrgGroups = new Array();
        for (var l = 0; l < excelData.length; l++) {
          allOrgGroups.push(excelData[l]["Organizational Group"]);
        };
      console.log(allOrgGroups);
      //remove duplicates
      var uniqueOrgGroups = new Array();
      //Add the first orgGroup to uniqueOrgGroups
      uniqueOrgGroups.push(allOrgGroups[0]);

        for (var m = 0; m < allOrgGroups.length; m++) {
          var comparison = uniqueOrgGroups.indexOf(allOrgGroups[m]);
          console.log("Compare:"+ comparison);
          if(comparison==-1){
            // If flight doesn't exist in unique, add to it
            console.log("-1 occured");
            uniqueOrgGroups.push(allOrgGroups[m]);
          }
        };
      console.log("Unique Org Groups are"+uniqueOrgGroups);

      //B) Store into Unit the org groups:
      //first create the objects that UNIT will expect {number:XX,name:XXXX};
      var customOrgs = new Array();

        for (var n = 0; n < uniqueOrgGroups.length; n++) {
          var org = new Object({number: n+1,name:uniqueOrgGroups[n]});
          customOrgs.push(org);
        };

      console.log("Custom Orgs are");
        for (var o = 0; o < customOrgs.length; o++) {
          console.log(customOrgs[o]);
        };

      //Save into DB
        //a. Get Model
      Unit.findOne({unitID:unitID}, function(err,doc){
        for (var p = 0; p < customOrgs.length; p++) {
          doc.orgGroups.push(customOrgs[p]);
        };
        doc.save();
        console.log("Organizational Groups saved in Unit Database");
        callback(null,excelData,customOrgs);
      })
    },
    // translate the org groups in the excel data from name to number ("e.g. Hornet Flight => 2")
    function(excelData,customOrgs,callback){
      for (var q = 0; q < excelData.length; q++) {
        for (var r = 0; r < customOrgs.length; r++) {
          var orgName = customOrgs[r].name;
            if(excelData[q]["Organizational Group"] == orgName){
              excelData[q].orgNum = customOrgs[r].number;
            }
        };
      };
      console.log("Translated orgnames are");
      for (var r = 0; r < excelData.length; r++) {
        console.log(excelData);
      };
      callback(null,excelData,customOrgs);
    },
    //save objects into db. C)Grab DB, D)Save into that DB
    //C)
    function(excelData,customOrgs,callback){
      Unit.findOne({unitID:unitID},function(err,doc){
        if(err) return console.log(err);
        console.log(doc);
        callback(null,excelData,doc,customOrgs);
      })
    },
    //
    function(excelData,doc,customOrgs,callback){
      var finalizedData = excelData;
      for (var i = 0; i < excelData.length; i++) {
        //Create the object to store in db
        var handle = excelData[i];
        var cadet = new Object({"CIN":handle.CIN, "Rank":handle.rankNum, "LastName": handle["Last Name"], "FirstName":handle["First Name"], "OrgGroup": handle.orgNum, "TrgGroup":handle["Training Group"]});
        console.log("DEBUG:"+cadet);

        //push to db
        doc.cadets.push(cadet);
        doc.save();


        //delete file
        //UNDELETE THIS fs.unlinkSync(filePath);

        
      };
      console.log("Custom orgs are");
      console.log(customOrgs);
      callback(null,finalizedData,customOrgs);
    }
  ],
  function(err,finalizedData,customOrgs){
    if(err) return console.log(err);
    console.log("***UNCOMMENT THE DELETE FILE");

    var sendData = JSON.stringify(finalizedData);

    console.log("sendData is" +sendData);

    res.end('{"success" : "Updated Successfully", "status" : 200, "data": '+sendData+',"orgGroupsContainer":'+JSON.stringify(customOrgs)+' }'); 

  })
  
}



//== END FIRST RUN TESTS


app.set('port', process.env.PORT || 3000);




//======================= HANDLING POST REQUESTS FOR REGISTRATION AND LOGIN ====//

//Handle Registration
app.post('/registration', urlencodedParser, function (req, res) {
 Controller.registration(req,res);
    
})

//Handle the login
app.post('/sessions', urlencodedParser, function (req, res) {
  Controller.login(req,res);
})

app.post('/api/purgeUnitTable', urlencodedParser, function (req,res){
  api.purgeUnitTable(req,res);
})


//======================= HANDLING FILE UPLOAD ====//
app.post('/uploadAttendance', urlencodedParser, function (req, res) {

console.log("UPLOAD ATTENDANCE INVOKED!");
console.log(req.files) 
console.log("Saved file is @ "+req.files.attendanceFile.path);

console.log("READ DAT EXCEL FILE");



var filePath = __dirname + '\\'+req.files.attendanceFile.path;

       

var dbName = req.session.user.unitID+"cadets"; 
var unitID = req.session.user.unitID;           
//send back success message
console.log("ABOUT TO ETL the document")

ETLCadetsExcel(filePath,1,unitID,res);



})

app.post('/uploadAttendanceTEST',urlencodedParser, function(req,res){
  console.log("UPLOADATTENDANCE");
  console.log(req.files);
})







// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
console.log(__dirname);
console.log(fs.readdirSync(path.join(__dirname, 'views/')));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//RANDOM FUNCTIONS TEST
function ETLCadets(filePath,rankElement,UnitModel,unitID,res){
       async.waterfall([

        //get the ranks data first
          function(callback){
            console.log("FILEPATH********* is"+filePath);
            console.log("Callback 1 = "+callback);            //get ranks
            Rank.find({'rankElement': 1}, 'rankNumber rankShort', function(err,rankData){
              console.log("FUNCTION1***");
              //console.log("result is "+result);
                //console.log(rankData);  
                console.log("Function 1 rank DATA is "+rankData);
              callback(null,rankData);
              })
          },
          //EXTRACT from excel file
          function(rankData,callback){
            console.log("Function 2 start"+rankData);
            //console.log("callback = "+callback);

            converter({ input: filePath, output: null}, function(err, result) {
                if(err) return console.error(err);
                   console.log(result);
                   //GRAB ALL THE UNIQUE ORG NAMES FROM DATA SET
                   var orgGroupsContainer = new Array(); // Holds all the unique org names
                   // Loop through results 
                   for (var i = 0; i < result.length; i++) {
                    var orgGroupName = result[i]["Organizational Group"];
                   console.log("start iteration");
                     console.log(orgGroupName);
                    //DEBUG console.log("org group ="+orgGroup);
                      //Check if org group already exists in array. 
                    
                      //If the orgGroupsContainer container HAS something
                      if(orgGroupsContainer.length > 0){

                        var exists = false;
                        for (var i = 0; i < orgGroupsContainer.length; i++) {
                           if(orgGroupsContainer[i].name == orgGroupName)
                            exists = true;
                        };

                        if (!exists){
                          var oGroup = new Object({number:orgGroupsContainer.length+1,name:orgGroupName});
                          orgGroupsContainer.push(oGroup);

                        }

                      }
                      //If it doesn't have something, just add to it the very first one
                      else{
                        var oGroup = new Object({number: 1,name:orgGroupName});
                        orgGroupsContainer.push(oGroup);
                      }
                     

                   }

                   console.log("Unique org group names are "+orgGroupsContainer);
                   for (var i = 0; i < orgGroupsContainer.length; i++) {
                     console.log(orgGroupsContainer[i]);
                   };
                   //console.log("Hornet flight =" +(orgGroupsContainer.indexOf("Hornet")+1));

                   console.log("before callback "+result);
                   callback(null,rankData,result,orgGroupsContainer);

                  
                //callback(null, rankData,result,orgGroupsContainer);  
          });
           
              

       },
          //Save orgGroupsContainer in UNIT
          function(rankData,result,orgGroupsContainer,callback){

            Unit.findOne({unitID: unitID},function(err,doc){
              if(err) return console.log(err);
              doc.orgGroups = orgGroupsContainer;
              doc.save();
              callback(null,rankData,result,orgGroupsContainer);
              
            });
             
          },
          //Transform each excel data cadet to have a rank number associated to name
          function(rankData,result,orgGroupsContainer,callback){
            console.log("Function 2");
            console.log("result is "+result);
            console.log("rank data is "+rankData);  
            for (var i = 0; i < result.length; i++) {
              var rName = result[i]["Rank"];
              console.log("rName is "+rName);
              for (var x = 0; x < rankData.length; x++) {
                if(rName === rankData[x].rankShort){
                  console.log("MATCH: rName:"+rName+"=Number"+rankData[x].rankNumber);
                  result[i]['rankNum'] = rankData[x].rankNumber;
                }
              };
              console.log("Rank was "+rName+"and now rank number is "+result[i].rankNum);
            }
          var rankedData = result;
          callback(null,rankedData,orgGroupsContainer);
          },
          //Transform each record to have a number reference to org
          function(rankedData,orgGroupsContainer,callback){
            console.log("Finish adding to db here");
            console.log(rankedData);
            console.log("ranked data length = "+rankedData.length);
            var endResult = "orgData";
            console.log(orgGroupsContainer);
            for (var y = 0; y < rankedData.length; y++) {
              console.log("START: y = "+y);
                  console.log("Matching cadet orgName to orgNumber");
                  console.log("Cadet orgGroup Name "+rankedData[y]['Organizational Group']);

                  //check against orgGroupsContainer
                  for (var x = 0; x < orgGroupsContainer.length; x++) {
                    var lcRankedOg = rankedData[y]['Organizational Group'].toLowerCase();
                    var lcOgc = orgGroupsContainer[x].name.toLowerCase();
                    if(lcRankedOg === lcOgc){
                      console.log("MATCH!");
                      rankedData[y].orgGroup = orgGroupsContainer[x].number;
                    }
                    else{
                      console.log("NO MATCH!");
                    }
                  };
                  

              console.log(rankedData[y]);
              console.log("END y = "+y);
            };

            console.log("Ranked + Orged Data ="+rankedData);
            console.log(rankedData);
            var finalizedData = rankedData;

            callback(null,finalizedData,orgGroupsContainer);
          },
          function(finalizedData,orgGroupsContainer,callback){
            console.log("ALL WE GOTTA DO IS SAVE INTO DB NOW");
            var endResult = "END MESSAGE";
            callback(null,endResult,finalizedData,orgGroupsContainer);
          },
          function(endResult,finalizedData,orgGroupsContainer,callback){
            UnitModel.findOne({unitID:unitID}, function(err,doc){
              if(err) return console.log(err);
              callback(null,doc,endResult,finalizedData,orgGroupsContainer);
            })
            //callback(null,doc,endResult,finalizedData,orgGroupsContainer)
          }
        ],
        function(err,doc,endResult,finalizedData,orgGroupsContainer){
          if(err) return console.log(err);
          console.log(endResult);
          //var tempCadet = mongoose.model(dbName,cadetSchema);
          for (var i = 0; i < finalizedData.length; i++)
          {
            var handle = finalizedData[i];
            var cadet = new Object({"CIN":handle.CIN, "Rank":handle.rankNum, "LastName": handle["Last Name"], "FirstName":handle["First Name"], "OrgGroup": handle.orgGroup, "TrgGroup":handle["Training Group"]});
            console.log("Before push, cadet is"+cadet);
             doc.cadets.push(cadet);
           }; 
           doc.save();
           console.log("SAVED INTO DB");

           //Now delete that file
           fs.unlinkSync(filePath);

           console.log("Finalized data to send back is "+finalizedData);
           console.log(JSON.stringify(finalizedData));
           console.log(JSON.parse(JSON.stringify(finalizedData)));

           var sendData = JSON.stringify(finalizedData);

           console.log("sendData is" +sendData);
     
      res.end('{"success" : "Updated Successfully", "status" : 200, "data": '+sendData+',"orgGroupsContainer":'+JSON.stringify(orgGroupsContainer)+' }');   })
     }


module.exports = app;
