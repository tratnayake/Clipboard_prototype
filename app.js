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


//Models
var Unit = require('./models/unit.js');
var User = require('./models/user.js');
var Rank = require('./models/rank.js');


var app = express();
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
    var testUnit = new Unit({ unitID:999, unitName:"TEST", unitType: 1, unitStatus: 1});
        testUnit.save(function(err,testUnit,numberAffected){
            if (err) return console.log(error);
            console.log("999 added to db");
        })
        var testUnit2 = new Unit({ unitID:6666, unitName:"Hells-Gate", unitType: 2, unitStatus: 1});
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



//======================= HANDLING FILE UPLOAD ====//
app.post('/uploadAttendance', urlencodedParser, function (req, res) {

 
console.log(req.files) 
console.log("Saved file is @ "+req.files.attendanceFile.path);


//send back success message
res.end('{"success" : "Updated Successfully", "status" : 200}');

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


module.exports = app;
