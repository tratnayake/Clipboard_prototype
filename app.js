var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');

var app = express();

var routes = require('./routes/index');
var users = require('./routes/users');

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(cookieParser('OurSecret'));

//Import the user schema
var User = require('./models/user.js');
//Mongoose stuff
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Connection to db worked!");

  })






// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);



//Handle Registration
app.post('/registration', urlencodedParser, function (req, res) {
    console.log("TEST");
  if (!req.body) return res.sendStatus(400)
    //parse the request body and assign it to the new User object of type USER schema (imported above)
    var newUser = JSON.parse(JSON.stringify(req.body));
    console.log("firstName is" + newUser.firstName);
    console.log("newUser var is "+ newUser);

    //Hash the password
    var hashedPW = bcrypt.hashSync(newUser.password);


    var dbEnter = new User({emailAddress: newUser.emailAddress,passwordHash: hashedPW, firstName: newUser.firstName, lastName: newUser.lastName });
    //DEBUG
    console.log("the dbEnter obj is "+dbEnter);
    
    //Insert that user into the database
    dbEnter.save(function (err, dbEnter){
        if(err) return console.error(err);
        console.log("has been added to db.")
    })

    var postRegData = new Object({firstName: dbEnter.firstName, emailAddress: dbEnter.emailAddress});
    //send user to postRegistration informing them to check email soon.
    res.render('postRegistration', {title: 'Registration Complete!', data: postRegData})
    
})

//Handle the login
app.post('/sessions', urlencodedParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
    console.log("SESSION POST INVOKED!");
console.log("Session request is "+JSON.stringify(req.body));

var userObject = JSON.parse(JSON.stringify(req.body));
console.log("User Object is "+userObject);
console.log("User Object email is "+userObject.emailAddress);

//compare the entered password against hashed password.
    //First get the user record belonging to the user.

    
   User.findOne({emailAddress: userObject.emailAddress}, function(err,results){
        if(err|| results == null){
            res.render('login',{title: 'Login', errorMessage: "That email or password does not exist in our datbase. Please enter a proper account."})
        }

        console.log(results);
        //Insert into cookie what the guy's userName is
        console.log("INITIAL COOKIE");
        console.log(req.cookies);
        console.log("INITIAL COOKIE SIGNED?");
        console.log(req.signedCookies['auth']);


        if(bcrypt.compareSync(userObject.password,results.passwordHash)){
            //if the password is correct. SIGN THE COOKIE. Redirect to welcome
            console.log("PW AUTH SUCCESS");
            res.cookie('auth','pass', {signed: true});
            //send to welcome page.
             res.render('welcome', {  title: 'Welcome Page', data: results});



        }
        else{
            //if the password does not match. DO NOT sign the cookie. Redirect to login.
            console.log("PW AUTH FAIL");
            res.render('login',{title: 'Login', errorMessage: "That email or password does not exist in our datbase. Please enter a proper account."})

        }

       
    });

})





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
