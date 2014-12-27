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

var api = require('api');


var app = express();
//SOCKET IO STUFF
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);
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
  socket.emit('firstReceipt', {message: "Thank-you, connection handshake completed from "+socket});
  socket.on('registrationUUID',function(data){
    console.log("Registration UUID invoked, UUID is "+data.UUID);
    var socketID = {UUID: data.UUID,Socket: socket};
    console.log("Socket ID obj is "+socketID);
    allSockets.push(socketID);
    console.log("Socket added to array")
    console.log("Size of array is: "+allSockets.length);
  })
  socket.on('disconnect',function(data){
    console.log("DISCONNECT!");
    for (var i = 0; i < allSockets.length; i++) {
      if(allSockets[i].Socket == socket){
        console.log("matches!")
        allSockets.splice(index,i);
        console.log("removed from array, size now"+allSockets.length);
      }
    };
  })
})


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

var filePath = (__dirname+'/uploads/TestData.xls');
//ETLCadets(filePath,1);



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
//send back success message 
var sendData = ETLCadets(filePath,1,dbName,res);

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
function ETLCadets(filePath,rankElement,dbName,res){
       async.waterfall([

        //get the ranks data first
          function(callback){
            console.log("Callback 1 = "+callback);            //get ranks
            Rank.find({'rankElement': 1}, 'rankNumber rankShort', function(err,rankData){
              console.log("FUNCTION1***");
              //console.log("result is "+result);
                //console.log(rankData);  
                console.log("Function 1 rank DATA is "+rankData)
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
                   var orgNames = new Array(); // Holds all the unique org names
                   // Loop through results 
                   for (var i = 0; i < result.length; i++) {
                    var orgGroup = result[i]["Organizational Group"];
                    //DEBUG console.log("start iteration");
                    //DEBUG console.log(orgNames);
                    //DEBUG console.log("org group ="+orgGroup);
                      //Check if org group already exists in array. (-1 means not in array)
                      if(orgNames.indexOf(orgGroup) == -1){
                        //DEBUG console.log("unique");
                        orgNames.push(orgGroup);
                      }
                      //else{
                        //DEBUG console.log("Not unique");
                      //}


                   }

                   console.log("Unique org group names are "+orgNames);
                   console.log("Hornet flight =" +(orgNames.indexOf("Hornet")+1));

                   console.log("before callback "+result);
                   callback(null,rankData,result,orgNames);

                  
                //callback(null, rankData,result,orgNames);  
          });
           
              

       },
          //Transform each excel data cadet to have a rank number associated to name
          function(rankData,result,orgNames,callback){
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
          callback(null,rankedData,orgNames);
          },
          //Transform each record to have a number reference to org
          function(rankedData,orgNames,callback){
            console.log("Finish adding to db here");
            console.log(rankedData);
            var endResult = "orgData";
            console.log(orgNames);
            for (var i = 0; i < rankedData.length; i++) {
              rankedData[i].orgGroup=orgNames.indexOf(rankedData[i]['Organizational Group'])+1;
              console.log(rankedData[i]);
            };

            console.log("Ranked + Orged Data ="+rankedData);
            console.log(rankedData);
            var finalizedData = rankedData;

            callback(null,finalizedData,orgNames);
          },
          function(finalizedData,orgNames,callback){
            console.log("ALL WE GOTTA DO IS SAVE INTO DB NOW");
            var endResult = "END MESSAGE";
            callback(null,endResult,finalizedData,orgNames);
          }
        ],
        function(err,endResult,finalizedData,orgNames){
          if(err) return console.log(err);
          console.log(endResult);
          var tempCadet = mongoose.model(dbName,cadetSchema);
          for (var i = 0; i < finalizedData.length; i++)
          {
            var handle = finalizedData[i];
            var cadet = new tempCadet({"CIN":handle.CIN, "Rank":handle.rankNum, "LastName": handle["Last Name"], "First Name":handle["First Name"], "OrgGroup": handle.orgGroup, "TrgGroup":handle["Training Group"]});
             cadet.save();
           }; 
           console.log("SAVED INTO DB");

           //Now delete that file
           fs.unlinkSync(filePath);

           console.log("Finalized data to send back is "+finalizedData);
           console.log(JSON.stringify(finalizedData));
           console.log(JSON.parse(JSON.stringify(finalizedData)));

           var sendData = JSON.stringify(finalizedData);

           console.log("sendData is" +sendData);
     
      res.end('{"success" : "Updated Successfully", "status" : 200, "data": '+sendData+',"orgNames":'+JSON.stringify(orgNames)+' }');   })
     }


module.exports = app;
