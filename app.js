var express = require('express'); //Express Framework
var path = require('path'); // For handling different file paths in WIN/LINUX
var favicon = require('serve-favicon'); //Serves the favicon..I think..?
var logger = require('morgan'); //Not really sure..lets assume logging
var cookieParser = require('cookie-parser'); // Parses user cookies
var session = require('express-session'); // Used for reading/writing from sess
var bodyParser = require('body-parser'); //Used for reading/writing request bods
var bcrypt = require('bcrypt-nodejs'); //IMPORTANT: For en/dehashing user pws.
var routes = require('./routes/index'); // C
var users = require('./routes/users');
var firstRun = require('./firstRun');
var fs = require('fs');
var multer = require('multer');
var converter = require("xls-to-json");  
var async = require('async');
var pdfkit = require('pdfkit');
var barcode = require('barcode');
var schedule = require('node-schedule');
var excelbuilder = require('msexcel-builder');

//===============================================CONTROLLERS================//
var Controller = require('./controllers/Controller'); // <-This is the main controller that handles render
var Database = require('./controllers/Database');

//===============================================MODELS====================//
var Unit = require('./models/unit.js');
var User = require('./models/user.js');
var Rank = require('./models/rank.js');
var Attendance = require('./models/attendance.js');

//Schemas
var cadetSchema = require('./schemas/cadet.js');


var api = require('./api');


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

//======================= GLOBAL VARIABLES===//
//1. This holds objects that contain a socket and UUID;
global.allSockets = [];

//2. Holds the scheduled threads for attendance sessions
global.scheduleAttendance = [];

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

firstRun.populateTestUnits();
firstRun.populateRanks();


//==============SOCKET.IO STUFF (TESTING?)=========================/


//var global.allSockets = [];

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
    global.allSockets.push(socketID);
    console.log("Socket added to array")
    console.log("Size of array is: "+global.allSockets.length)
    socket.emit('srvMsg',{message: "Thank you for completing the handshake. USER ___ has now been registered with socketIO"});
    socket.emit('registrationUUID',{message:"SUCCESS"});

    //Add user to a socket  room
    var UUID = data.UUID;
   
     User.findOne({_id:UUID},function(err,doc){
      if(err) return console.log(err);
      var unitID = doc.unitID;
      console.log("*****UNIT ID IS "+unitID);
      socket.join(unitID);
       console.log("Room"+unitID+"joined");


     })
    
  })

  /////DASHBOARD STUFF
    socket.on("UnitStats",function(data){
      console.log("**************getUnitStats invoked with data"+data);
      switch(data.command){
        // Get the number of cadets in unit for Dashboard
        case "getUnitStrength":
          console.log("unitStrength invoked");
          var UUID = getSocketUUID(global.allSockets,socket);
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
              socket.emit("updateUnitStats",{message: "unitStrength", data:strength});
            })
            
          })
          // Get the unitID + Name for panel on Dashboard
        case "getUnitDescrip":
        var UUID = getSocketUUID(global.allSockets,socket);
        console.log("UUID IS"+UUID);
        getUnitID(UUID,function(){
          var unitID = data;
          async.waterfall([
                function(callback){
                  //getUnitID
                  User.findOne({_id:UUID},function(err,doc){
                    if (err) return console.log(err);
                    var unitID = doc.unitID;
                    callback(null,unitID);
                  })
                  //callback(null,unitID);
                },
                function(unitID,callback){
                  Unit.findOne({unitID:unitID}, 'unitName', function(err,doc){
                    if(err) return console.log(err);
                    console.log("Doc is "+doc);
                    var unitName = doc.unitName;
                    var unitDescrip = unitID+" "+unitName;
                    //var unitDescrip = "999 AVENGEH";
                    callback(null,unitDescrip);
                  })
                }
              ],function(err,unitDescrip){
                socket.emit("updateUnitStats",{message: "unitDescrip", data:unitDescrip});
              })
        });
            
        break;
      
      }
    }) 
 


    socket.on("attendanceStats",function(data){
      console.log("**************getAttendanceStatts invoked with data"+data);
      switch(data.command){
        case "getNumAttendanceSessions":
        console.log("numAttendanceSessions");
        var UUID = getSocketUUID(global.allSockets,socket);
        console.log("UUID is"+UUID);
        User.findOne({_id:UUID},function(err,user){
          if(err) return console.log(err);
          //console.log(user);
          var unitID = user.unitID;
          var curDate = new Date();
          Attendance.where('endDateTime').gte(curDate).count({unitID:unitID}, function(err,count){
            if(err) return console.log(err);
            console.log(unitID+"has "+count+"attendance sessions");
             socket.emit("updateAttendanceStats",{message: "numAttendanceSessions", data:count});
          })
          
          
        })
        break;

        case "getAttendanceTable":
         var UUID = getSocketUUID(global.allSockets,socket);
         console.log("UUID IS"+UUID);
         Database.getUnitID(UUID,function(err,unitID){
          Attendance.find({unitID:unitID}, 'unitID startDateTime endDateTime',function(err,sessions){
            if(err) return console.log(err);
            var attendanceSessions = new Array();
              for (var i = 0; i < sessions.length; i++) {
                attendanceSessions.push(sessions[i]);
                console.log(attendanceSessions);
              };
              socket.emit("Attendance",{message:"attendanceSessionsTable", attendanceSessions:attendanceSessions});


          })
         })

        break;
              
           
          
            
          
         
    }
  })
  
	//async waterfall to get all the data needed for the add cadets page
	socket.on("getAddCadetsData", function(data) {
		async.waterfall([
			//1. get the UUID
			function(callback) {
				var UUID = getSocketUUID(global.allSockets, socket);
				//console.log("UUID is " + UUID)
				callback(null, UUID);
			},
			//2. get the UnitID
			function(UUID, callback) {
				User.findOne({_id:UUID}, function(err, doc) {
					var user = doc;
					var unitID = doc.unitID;
					//console.log("unitID is " + unitID);
					callback(null, UUID, unitID);
				})
			},
			//3. get the unitType
			function(UUID, unitID, callback) {
				Unit.where('unitID').equals(unitID).select('unitType -_id').exec(function(err, type) {
					//console.log("type is " + type[0].unitType);
					var unitType = type[0].unitType;
					callback(null, UUID, unitID, unitType);
				});
			},
			//4. get the ranks
			function(UUID, unitID, unitType, callback) {
				console.log("inside the ranks step");
				Rank.where('rankElement').equals(unitType).exec(function(err, ranks) {
					//console.log("ranks are " + ranks);
					var returnedRanks = ranks
					callback(null, UUID, unitID, unitType, returnedRanks);
				});
			},
			//5. get the org groups
			function(UUID, unitID, unitType, returnedRanks, callback) {
				Unit.where('unitID').equals(unitID).select('orgGroups -_id').exec(function(err, groups) {
					groupsData = groups[0].orgGroups;
					console.log("Groups are " + groupsData);
					callback(null, UUID, unitID, unitType, returnedRanks, groupsData);
				})
			}
		], function(err, UUID, unitID, unitType, returnedRanks, groupsData) {
			console.log("User: " + UUID + " from unit: " + unitID + " acessing addCadets");
			console.log("ranks " + returnedRanks);
			console.log("org groups " + groupsData);
			socket.emit("returnAddCadetsData", {groupData: groupsData, ranks: returnedRanks});
		})
	})

socket.on("barcodes",function(data){
  console.log("Barcodes has been invoked!");
    async.waterfall([
            //1. get the UUID
            function(callback){
              var UUID = getSocketUUID(global.allSockets,socket);
              console.log("Got the UUID, it's "+UUID);
              callback(null,UUID);
            },
            //2. Get the UnitID
            function(UUID,callback){
              User.findOne({_id:UUID},function(err,doc){
                if(err) return console.log(err);
                var user = doc;
                var unitID = doc.unitID;
                console.log("The unitID is "+unitID);
                callback(null,unitID);
              })
            },
            //3.grab all the attendance form the table
            function(unitID,callback){
              var currDate = new Date();
              var query = Unit.findOne({unitID:unitID}).select('cadets');
                query.exec(function(err,docs){
                  if(err) return console.log(err);
                  console.log("Got the cadets");
                  var cadets= docs;
                  callback(null,cadets);
                })
            }, // 4. Get the CINs
            function(cadets,callback){
              console.log(cadets);
              var Cadets = new Array();
              for (var i = 0; i < cadets.cadets.length; i++) {
                console.log("CIN: "+cadets.cadets[i].CIN);

                Cadets.push(cadets.cadets[i]);
              };
              callback(null,Cadets);
            },
            //5. Make barcodes and push into an array
            function(Cadets,callback){
              
              var barcodesArray = new Array();
              for (var i = 0; i < Cadets.length; i++) {
                var cdtBarcode = barcode('code39',{
                  data:"it works",
                  width: 200,
                  height: 100
                });
                barcodesArray.push(cdtBarcode);
              };
              callback(null,barcodesArray,Cadets);
            },
            //6. test that you can generate barcodes
            function(barcodesArray,Cadets,callback){
              
              console.log("outfile is"+outfile);

              var outFiles = new Array();
             
              for (var i = 0; i < barcodesArray.length; i++) {
                var outfile = (path.join(__dirname,"uploads","barcodes",""+i+"code.png"));
                outFiles.push(outfile);
                  barcodesArray[i].saveImage(outfile, function (err) {
                      if (err) console.log(err);

                      console.log('File has been written!');
                  });

                 
              };
              setTimeout(function() {
                callback(null,outFiles,Cadets);
              }, 2500);
             
            },
            

          ],
            //endFunction
            function(err,outFiles,Cadets){
             console.log("DONE!");
             console.log("File 1 is "+outFiles[0]);
              doc = new pdfkit;
              
              var savePath = path.join(__dirname,"barcodefiles");
              var ws = fs.createWriteStream(path.join(savePath,'output.pdf'));
              doc.pipe(ws);
              for (var i = 0; i < outFiles.length; i++) {
                
                 doc.image(outFiles[i]).text(Cadets[i].LastName+","+Cadets[i].FirstName);
                 doc.moveDown();
                 doc.moveDown();
                 console.log("Written to pdf");
                  fs.unlinkSync(outFiles[i]);
                  console.log("file deleted");
              };
             
              doc.end();
              var downloadPath = path.join(savePath,"output.pdf");
              socket.emit("downloadBarcodes",{message:downloadPath});
             
              }

)
         
})

socket.on("Attendance",function(data){
  console.log("Attendance Related Socket Event received");
  console.log("Data is"+data.command);
  switch (data.command){
    case "GET":
      
      console.log("UUID is"+UUID);
      //Database.getAttendance(UUID,)
      break;
    case "GETATTENDANCESESSIONS":


      break;
      case "CHECKACTIVE":
      console.log("Inside CHECK ACTIVE");
      
      console.log("UUID is"+UUID);
      //1. Get UnitID
      var UUID = getSocketUUID(global.allSockets,socket);
      Database.getUnitID(UUID,function(err,data){
        var unitID = data;
           //2. Check activeAttendances
            Database.checkAttendanceActive(999,function(err,data){
              if(err) return console.log(err);
              if(data.length > 0){
                socket.emit("Attendance",{message:"SESSIONACTIVE",endTime: data[0].endDateTime,attendanceID:data[0]["_id"]});
              }
              else{
                socket.emit("Attendance",{message:"NOSESSIONACTIVE"});
              }
            });

      })
     

      break;

      case "generateExcelDoc":
      console.log("Generate Excel Doc received");
      console.log("Get Attendance Names invoked");
      var UUID = getSocketUUID(global.allSockets,socket);
      console.log("GETNAMES UUID IS"+UUID);
      var attendanceID = data.attendanceID;
      Database.getUnitID(UUID,function(err,unitID){
        generateAttendanceExcel(attendanceID,unitID);
        var savePath = path.join(__dirname, 'completedAttendance');
        var fileSavePath = path.join(savePath, attendanceID+'.xlsx');
        socket.emit("Attendance",{message:"DOWNLOADREADY", url: fileSavePath});
      }) 
      break;

      case "DELETEATTENDANCE":
      console.log("Delete Attendance Doc received");
      var UUID = getSocketUUID(global.allSockets,socket);
      console.log("GETNAMES UUID IS"+UUID);
      var attendanceID = data.attendanceID;
      console.log("Attendance ID is"+attendanceID);
      Attendance.findByIdAndRemove(attendanceID,function(err,data){
        if(err) return console.log(err);
        console.log(data);
        socket.emit("Attendance",{message:"DELETESUCCESSFUL"});
      });

      case "GETNAMES":
      console.log("Get Attendance Names invoked");
      var UUID = getSocketUUID(global.allSockets,socket);
      console.log("GETNAMES UUID IS"+UUID);
      //var attendanceID = data.attendanceID;
      Database.getUnitID(UUID,function(err,unitID){
        Database.getUnitCadets(unitID,function(err,cadets,orgGroups){
          socket.emit("Attendance",{message:"GETCADETS",cadets:cadets,orgGroups:orgGroups});
          console.log("All the cadets have been emitted back to the front end");
        })
      })
      break;

      case "SIGNIN":
      console.log("Sign in has been invoked");
      var UUID = getSocketUUID(global.allSockets,socket);
      console.log("SIGNINUUID is"+UUID);
      var cadetFormData = data.cadet;
      console.log(cadetFormData);
      cadetData = cadetFormData;
      cadetFormData = cadetFormData.split(" ");
      var CIN = cadetFormData[0];
      var attendanceID = data.attendanceID;
      var attendanceLocation = data.attendanceLocation;
      Database.signInCadet(attendanceID,CIN,attendanceLocation,function(err,data){
        if(err){
          socket.emit("Attendance",{message:"UNSUCESSFUL", data: "please re-enter"})
        }
        
          //edit here for mulitple rooms
          Database.getUnitID(UUID,function(err,unitID){
            io.to(unitID).emit("Attendance",{message:data,cadet:cadetData});
          })
          


      })
    break;

    case "GETLIVESTATS":
     console.log("GETLIVESTATS has been invoked");
     var UUID = getSocketUUID(global.allSockets,socket);
      console.log("SIGNINUUID is"+UUID);
     var attendanceID = data.attendanceID;
     console.log("AttendanceID is"+attendanceID);
     //1. Get total
     async.waterfall([
      function(callback){

        Database.getUnitID(UUID,function(err,unitID){
        Unit.findOne({unitID:unitID},function(err,unit){
          var totalCount = unit.cadets.length;
          callback(null,unitID,totalCount);
        })
       })
     
      }, function(unitID,totalCount,callback){
        Attendance.findOne({_id:attendanceID},function(err,attendance){
          var signedInCount = attendance.cadets.length;
          var excusedCadetsCount = attendance.excusedCadets.length;
          callback(null,unitID,totalCount,signedInCount,excusedCadetsCount)
        })
      }
    ],
    function(err,unitID,totalCount,signedInCount,excusedCadetsCount){
      io.to(unitID).emit("Attendance",{message:"UPDATELIVESTATS",totalCount:totalCount,signedInCount:signedInCount,excusedCadetsCount:excusedCadetsCount});
    })
     break;

     case "ENDATTENDANCE":
     console.log("ENDATTENDANCE invoked");
     var UUID = getSocketUUID(global.allSockets,socket);
      console.log("SIGNINUUID is"+UUID);
     var attendanceID = data.attendanceID;
     console.log("AttendanceID is"+attendanceID);
      Database.getUnitID(UUID,function(err,unitID){
        endAttendance(unitID,attendanceID);
        io.to(unitID).emit("Attendance",{message:"ENDATTENDANCECOMPLETE"});
      });
      
        

  }

})




//HELPER FUNCTION TEST

function endAttendance(unitID,attendanceID){
  async.waterfall([
    function(callback){
      var CINs = new Array();
      Unit.findOne({unitID:unitID},function(err,unit){
        if(err) return console.log(err);
        var cadets = unit.cadets;
        for (var i = 0; i < cadets.length; i++) {
          CINs.push(cadets[i].CIN);
          
        };
        callback(null,CINs);
      })
      
    },
    function(CINs,callback){
      Attendance.findOne({_id:attendanceID},function(err,attendance){
        var CINspresent = new Array();
        var CINsexcused = new Array();
        //1. Remove if present
        for (var i = 0; i < attendance.cadets.length; i++) {
            for (var x = 0; x < CINs.length; x++) {
               if(CINs[x] == attendance.cadets[i].CIN){
                CINs.splice(x,1);
               }
             }; 
        };
        //2. Remove if excused
        for (var y = 0; y < attendance.excusedCadets.length; y++) {
          for (var z = 0; z < CINs.length; z++) {
            if(CINs[y] == attendance.excusedCadets[y].CIN){
              CINs.splice(y,0);
            }
          };
         
        };
        //3. Put remainer into absentCadets
        for (var i = 0; i < CINs.length; i++) {
         attendance.absentCadets.push(CINs[i]);
        };
        

        //4. End attendance by making currentDateTime the end session
        var currentDate = new Date();
        attendance.endDateTime = currentDate;
        attendance.save();
        callback(null,CINs);
      })

    }


  ],
  function(err,CINs){
    console.log("Attendance pushed and saved into table");
  })
  //1. Grab all the cadets that WERE here + excused
}
function updateAttendanceStats(UUID){
  User.findOne({_id:UUID},function(err,user){
            if(err) return console.log(err);
            //console.log(user);
            var unitID = user.unitID;
            var curDate = new Date();
            Attendance.where('endDateTime').gte(curDate).count({unitID:999}, function(err,count){
              if(err) return console.log(err);
              console.log(unitID+"has "+count+"attendance sessions");
              //UPDATE ERRBODY IN THAT SQN
               io.to(unitID).emit("updateAttendanceStats",{message: "numAttendanceSessions", data:count});
            })
            
            
  })
}
  //---SCHEDULE ATTENDANCE RELATED FUNCTIONS --
  socket.on('scheduleAttendance',function(data){

    var command = data.command;
    console.log("Command is "+command);

    switch(command){
      case "getUnitCadets":
        console.log("getUnitCadets invoked");
        console.log("socket is"+socket);
        var UUID = getSocketUUID(global.allSockets,socket);

        Database.getUnitID(UUID,function(err,unitID){
          var unitID = unitID;
          Database.getUnitCadets(unitID,function(err,cadets,orgGroups){

              socket.emit("getUnitCadetsDATA",{Cadets: cadets, OrgGroups: orgGroups});
          })
        })
        
       
          //

          //socket.emit('getUnitCadets',{orgUnits: orgUnits, cadets: cadets});
        
        
        break;
        case "reviewedList":
        console.log("Reviewed List invoked");
        console.log(data);
        //get Attendance Table


        var tempVar = data;
        console.log(tempVar);
        console.log(tempVar)

        

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

       
       var UUID = getSocketUUID(global.allSockets,socket);
       console.log("BEFORE FIND , UUID IS" + UUID);
        User.findOne({_id:UUID},function(err,doc){
        if(err) return console.log(err);
        console.log(doc);
        var user = doc;
        var unitID = user.unitID;

        var tempAttendance = new Attendance({unitID: unitID, startDateTime : saveStartDateTime, endDateTime: saveEndDateTime,cadets:[]});
       console.log("tempAttendance looks like"+tempAttendance);

       //var tempSessionCadets = tempVar.data.sessionCadets;

       //var CINholder = new Array();
       //for (var i = 0; i < tempSessionCadets.length; i++) {
        //console.log("TempSessCad is"+tempSessionCadets[i]);
         //CINholder.push(tempSessionCadets[i]);
         //console.log(tempSessionCadets[i]+"added to temp object");

       //};

       tempAttendance.cadets;
       //if there are excuses
       console.log("Excused Cadets length IS"+tempVar.data.excusedCadets.length);
       if(tempVar.data.excusedCadets.length > 0){
        var excusedCadets = tempVar.data.excusedCadets;
        console.log("Excused cadets");
        for (var i = 0; i < excusedCadets.length; i++) {
          var excusedCadet = new Object({CIN:excusedCadets[i].CIN,excuse:excusedCadets[i].excuse});
          tempAttendance.excusedCadets.push(excusedCadet);
        };
       }
       else{
        console.log("NO Excused Cadets");
       }



       tempAttendance.save(function(err,result){
        if(err) return console.log(err);
        console.log("SAVED?!?!0");
        console.log(result);

        //create node schedule to fire when attendance schedule
        var scheduleThread = schedule.scheduleJob(result.startDateTime, function(){
            console.log('\n\n\n\n\n\n*********************ATTENDANCE SESSION FIRED!');

            //When the event fires, populate attendnace.cadets with everyone in the unit.


            io.to(unitID).emit('event', {type: "Attendance", message:"ACTIVE"});
            console.log("MESSAGE EMITTED TO SOCKET"+unitID);

        });

        var attendanceID = result["_id"];
        
        var attendanceScheduleObject = new Object({attendanceID: attendanceID, scheduleThreadObj: scheduleThread});

        global.scheduleAttendance.push(attendanceScheduleObject);

        console.log("**\n\n\n\nScheduled Thread created, started, and running for"+result.startDateTime.toString()+"also added to array");   
     


       });
       console.log("Changes saved to db");
       

       

                
     

        socket.emit("scheduleAttendance",{message:"SUCCESS",data: tempVar});
        console.log("Success message sent back")
        updateAttendanceStats(UUID);
       })
       
    }


  })

  //Happens when client disconnects
  socket.on('disconnect',function(data){
    console.log("DISCONNECT!");
    for (var i = 0; i < global.allSockets.length; i++) {
      if(global.allSockets[i].Socket == socket){
        console.log("matches!")
        var UUID = global.allSockets[i].UUID;
       
        global.allSockets.splice(i,1);
        console.log("removed from array, size now"+global.allSockets.length);

        //remove from room
        leaveRoom(UUID,socket);
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

function leaveRoom(UUID,socket){
  async.waterfall([
    function(callback){
      User.findOne({_id:UUID},function(err,doc){
            if(err) return console.log(err);
            var unitID = doc.unitID;
            console.log("*****UNIT ID IS "+unitID);
            socket.leave(unitID);
            console.log("Room"+unitID+"LEFT");
            callback(null,unitID);
      })
    }
  ],
    function(err,unitID){
      console.log("CONFIRMED! "+unitID+"has been left");
    }
  )
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
//var global.allSockets = [];
////on connection, associate a userID;
//io.sockets.on('connection', function(socket) {
  //var userId = global.allSockets.push(socket);
  //console.log("The userID is "+userId);
  //socket.on('newChatMessage', function(message) {
   // console.log(data);
    //socket.broadcast.emit('newChatMessage_response', {data: message});
  //});
  //socket.on('privateChatMessage', function(message, toId) {
   // global.allSockets[toId-1].emit('newPrivateMessage_response', {data: message});
  //});
  //socket.broadcast.emit('newUserArrival', 'New user arrived with id of: ' + userId);
//});

//==============FIRST RUN TESTS BECAUSE I'm TOO LAZY TO COMPILE SHIT




//Database functions test

//getAttendanceNames("54a8614608847fe806b1798f",function(err,data){
//  console.log(data);
//});

//generateAttendanceExcel("54a9e7e593e8134c0610b7a0",999);






function pushArrayElements(arrayFrom,arrayTo){
  if(arrayFrom.length > 0 ){
    for (var i = 0; i < arrayFrom.length; i++) {
      arrayTo.push(arrayFrom[i]);
    };
  }
}

function printArrayElements(array){
  for (var i = 0; i < array.length; i++) {
    console.log(array[i]);
  };
}


//console.log("FIRST FUNCTIONS TEST");
//Database.getUnitID("54975d43f99af2f00ca405b9",function(err,unitID){
//    console.log("TEST1A: The unitID is"+unitID);
// });






//async.waterfall([
  //function(callback){
   //console.log(getUnitID("54975d43f99af2f00ca405b9"));
    
    //callback(null);
  //},
  //function(callback){
     //console.log(getUnitID2("54975d43f99af2f00ca405b9"));
    //callback(null);
  //}
//],
//function(err){
  //console.log("Funciton complete");
//})




//helperfunctions to test
function getUnitID(UUID,callback){
    User.findOne({_id:UUID},function(err,doc){
          if(err){
            callback(err);
          } 
          else{
            callback(null,doc.unitID);
          }
       })
 }

 function getUnitID2(UUID){
    async.waterfall([
      function(callback){
        User.findOne({_id:UUID}, function(err,user){
          if(err) return console.log(err);
          console.log("GetUnitID2 user is"+user);
          console.log("Ther user is of that is"+user.unitID);
          var testUnitID = user.unitID;
          console.log("After assigning that to a var is "+testUnitID);
          callback(null,user.unitID);
        })
      }
    ],
      function(err,unitID){
        return unitID; 
      }
      
    )
}




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
      console.log("*******LENGTH of excelData is "+excelData.length);
      for (var i = 0; i < excelData.length; i++) {
        //Create the object to store in db
        var handle = excelData[i];
        var cadet = new Object({"CIN":handle.CIN, "Rank":handle.rankNum, "LastName": handle["Last Name"], "FirstName":handle["First Name"], "OrgGroup": handle.orgNum, "TrgGroup":handle["Training Group"]});
        console.log("DEBUG:"+cadet);

        //push to db
        doc.cadets.push(cadet);
   
      };
      doc.save();
      console.log("Custom orgs are");
      console.log(customOrgs);
      callback(null,finalizedData,customOrgs);
    }
  ],
  function(err,finalizedData,customOrgs){
    if(err) return console.log(err);
    console.log("***UNCOMMENT THE DELETE FILE");
    //delete file
    console.log("File Path is" +filePath);
      fs.unlinkSync(filePath);

    var sendData = JSON.stringify(finalizedData);

    console.log("sendData is" +sendData);

    res.end('{"success" : "Updated Successfully", "status" : 200, "data": '+sendData+',"orgGroupsContainer":'+JSON.stringify(customOrgs)+' }'); 

  })
  
}

function generateAttendanceExcel(attendanceID,unitID){
  console.log("GENERATE ATTENDANCE EXCEL!");
  //1. Get all the data from Attendance Table
    async.waterfall([
      function(callback){
        Attendance.findOne({_id:attendanceID},function(err,attendance){
          if(err) return console.log(err);
          callback(null,attendance);
        })
      },
      function(attendance,callback){
        //console.log(attendance);
        var present = new Array();
        var excused = new Array();
        var absent = new Array();

        //excusedcadets, first check if null
        if(attendance.excusedCadets.length > 0){
          for (var i = 0; i < attendance.excusedCadets.length; i++) {
            excused.push(attendance.excusedCadets[i]);
          };
        }

        //absent cadets, first check if null
        if(attendance.absentCadets.length > 0){
          for (var i = 0; i < attendance.absentCadets.length; i++) {
            absent.push(attendance.absentCadets[i]);
          };

        }

        //presentCadets
        if(attendance.cadets.length > 0){
          for (var i = 0; i < attendance.cadets.length; i++) {
            present.push(attendance.cadets[i].CIN);
          };
        }

        callback(null,attendance,present,excused,absent);
      },
      //Grab all cadets from users
      function(attendance,present,excused,absent,callback){
        Unit.findOne({unitID:unitID},function(err,docs){
          if(err) return console.log(err);
          var cadets = docs.cadets;
          var orgGroups = docs.orgGroups;
          callback(null,attendance,present,excused,absent,cadets,orgGroups);
        })

      },
      function(attendance,present,excused,absent,cadets,orgGroups,callback){
        //console.log(cadets);
        //console.log(excused);
        var excusedPrint = new Array();
        //Only populate excused cadets, if there are ACTUALLY excused cadets.
        if(excused.length > 0){
          console.log("excused NOT empty");
          console.log("Excuse "+excuse);
          for (var i = 0; i < excused.length; i++) {
            for (var j = 0; j < cadets.length; j++) {
             if(excused[i].CIN == cadets[j].CIN){
              var excusedObject = new Object({cadet:cadets[j],status: "E",excuse:excused[i].excuse})
              excusedPrint.push(excusedObject);
             }
             else{
              console.log("No MATCH!");
             }
            };
          };
        }

        else{
          console.log("Excused Empty");
        }
        console.log("Excused Print"+excusedPrint);

        var absentPrint = new Array();
        //Only populate excused cadets, if there are ACTUALLY excused cadets.
        if(absent.length > 0){
          console.log("Absent NOT empty");
          console.log("Absent"+absent);

          for (var i = 0; i < absent.length; i++) {
            //console.log("ABSENT "+i+":"+absent[i]);
            for (var j = 0; j < cadets.length; j++) {
             // console.log("CIN:"+cadets[j].CIN)
             if(absent[i] == cadets[j].CIN){
             var absentObject = new Object({cadet:cadets[j],status: "A"})
              absentPrint.push(absentObject);
             }
             else{
              //console.log("No MATCH!");
             }
            };
          };
        }
        console.log("Absent Print "+absentPrint);

        var presentPrint = new Array();
        //Only populate excused cadets, if there are ACTUALLY excused cadets.
        if(present.length > 0){
          console.log("present NOT empty");
          //console.log("present"+present);

          for (var i = 0; i < present.length; i++) {
            //console.log("present "+i+":"+present[i]);
            for (var j = 0; j < cadets.length; j++) {
             // console.log("CIN:"+cadets[j].CIN)
             if(present[i] == cadets[j].CIN){
             var presentObject = new Object({cadet:cadets[j],status: "P"})
              presentPrint.push(presentObject);
             }
             else{
              //console.log("No MATCH!");
             }
            };
          };
        }
        console.log("present Print "+presentPrint);

        console.log("\n\nTime To Check The Arrays\n\n");

        console.log("\nPresent\n");
        for (var i = 0; i < presentPrint.length; i++) {
          //console.log(presentPrint[i]);
        };

        console.log("\nAbsent\n");
        for (var i = 0; i < absentPrint.length; i++) {
          //console.log(absentPrint[i]);
        };

        console.log("\nExcused\n");
        for (var i = 0; i < excusedPrint.length; i++) {
          //console.log(excusedPrint[i]);
        };

        callback(null,attendance,presentPrint,absentPrint,excusedPrint,orgGroups);
      

      },
      function(attendance,presentPrint,absentPrint,excusedPrint,orgGroups,callback){
        var printArray = new Array();

        pushArrayElements(presentPrint,printArray);
        pushArrayElements(absentPrint,printArray);
        pushArrayElements(excusedPrint,printArray);

        console.log("FINAL PRINT ARRAY \n\n")
        for (var i = 0; i < printArray.length; i++) {
          console.log(printArray[i]);
        };

        callback(null,attendance,printArray,orgGroups);

      },
      //populate orgGroups
      function(attendance,printArray,orgGroups,callback){
        console.log(orgGroups);
        for (var i = 0; i < printArray.length; i++) {
          for (var x = 0; x < orgGroups.length; x++) {
             if(printArray[i].cadet.OrgGroup == orgGroups[x].number){
              printArray[i].OrganizationalGroup = orgGroups[x]["name"];
      
             };
          };
        };
   
        callback(null,attendance,printArray);
      },
      function(attendance,printArray,callback){
        Unit.findOne({unitID:unitID},function(err,unit){
          var unitType = unit.unitType;
            Rank.find({rankElement:unitType},function(err,ranks){
            callback(null,attendance,printArray,ranks);
            });
        });
        
      },
      //transform data and populate ranks
      function(attendance,printArray,ranks,callback){
        for (var i = 0; i < printArray.length; i++) {
          for (var x = 0; x < ranks.length; x++) {
            if(printArray[i].cadet.Rank == ranks[x].rankNumber){
              printArray[i].rankShort = ranks[x].rankShort;
            } 
          };
        };
        //console.log(printArray);
        callback(null,attendance,printArray);
      }
  ],
  //SAVE TO AN EXCEL FILE
  function(err,attendance,printArray){
    var attendanceStart = attendance.startDateTime;
    var attendanceEnd = attendance.endDateTime.toTimeString();
    var rowLength = printArray.length+2;

    var savePath = path.join(__dirname, 'completedAttendance');

      var workbook = excelbuilder.createWorkbook(savePath, attendanceID+'.xlsx')
  
      // Create a new worksheet with 10 columns and 12 rows
      var sheet1 = workbook.createSheet('sheet1', 8, rowLength);

      sheet1.set(1,1,unitID);
      sheet1.set(2,1,"Attendance Started At")
      sheet1.set(3,1,attendanceStart)
      sheet1.set(4,1,"Attendance Ended At")
      sheet1.set(5,1,attendanceEnd)
      
      // HeaderData
      sheet1.set(1, 2, 'CIN');
      sheet1.set(2, 2, 'Rank');
      sheet1.set(3, 2, 'Last Name');
      sheet1.set(4, 2, 'First Name');
      sheet1.set(5, 2, 'Org Group');
      sheet1.set(6, 2, 'Trg Group');
      sheet1.set(7, 2, 'Status');
      //sheet1.set(1, 8, 'I am title');


      for (var i = 0; i < printArray.length; i++) {
        var pA = printArray[i];
        var CIN = pA.cadet.CIN;
        var Rank = pA.rankShort;
        var LastName = pA.cadet.LastName;
        var FirstName = pA.cadet.FirstName;
        var OrgGroup = pA.OrganizationalGroup;
        var TrgGroup = pA.cadet.TrgGroup;
        var status = pA.status;

        sheet1.set(1,i+3,CIN);
        sheet1.set(2,i+3,Rank);
        sheet1.set(3,i+3,LastName);
        sheet1.set(4,i+3,FirstName);
        sheet1.set(5,i+3,OrgGroup);
        sheet1.set(6,i+3,TrgGroup);
        sheet1.set(7,i+3,status);
      };
      
      // Save it
      workbook.save(function(ok){
        if (!ok) 
          workbook.cancel();
        else
          console.log('congratulations, your workbook created');
      });

      console.log("FINISHED SAVING!");
      var fileSavePath = path.join(savePath, attendanceID+'.xlsx');
      
      
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



var filePath = __dirname + '/'+req.files.attendanceFile.path;

       

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


module.exports = app;
