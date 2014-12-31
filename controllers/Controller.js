var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.js');
var Unit = require('../models/unit.js');

var Controller = function() {};


    Controller.prototype.register = function (req,res){

        this.render(req,"Register",null,res);
       
    }

    Controller.prototype.print = function(){
        console.log("TESTPRINT");
    }


    Controller.prototype.registration = function(req,res){

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
        res.render('postRegistration', {title: 'Registration Complete!', data: postRegData});
    }


    Controller.prototype.login = function(req,res){
    	if (!req.body) return res.sendStatus(400)
        console.log("SESSION POST INVOKED!");
        console.log("Session request is "+JSON.stringify(req.body));

        var userObject = JSON.parse(JSON.stringify(req.body));
        console.log("User Object is "+userObject);
        console.log("User Object email is "+userObject.emailAddress);

        //compare the entered password against hashed password.
        //First get the user record belonging to the user.

        
       User.findOne({emailAddress: userObject.emailAddress}, function(err,results){
        console.log("results are" +results);
            if(err || results == null){
                console.log("results were null");
                res.render('login',{title: 'Login', errorMessage: "That email or password does not exist in our datbase. Please enter a proper account."})
            }
            else{

            console.log(results);
            //Insert into cookie what the guy's userName is
            //console.log("INITIAL COOKIE");
            //console.log(req.cookies);
            //console.log("INITIAL COOKIE SIGNED?");
            //console.log(req.signedCookies['auth']);


            if(bcrypt.compareSync(userObject.password,results.passwordHash)){
                //if the password is correct. SIGN THE COOKIE. Redirect to welcome
                console.log("PW AUTH SUCCESS");
                res.cookie('auth','pass', {signed: true});
                //put user's ID into cookie so object can be found easily later.
                res.cookie('userID',results._id, {signed: true});


                console.log("reqSess"+JSON.stringify(req.session));
                console.log("resSess"+res.session);

                var sess=req.session;
                sess.user = new Object();
                sess.user._id = results._id;
                sess.user.email = results.emailAddress;
                sess.user.authLevel =results.authLevel;
                sess.user.firstName = results.firstName;
                sess.user.lastName = results.lastName;
                sess.user.unitID=results.unitID;
                //res.session = sess;
                console.log("Session has been saved");

                console.log(sess);
                //send to welcome page.
                //res.render('Dashboard',{session: sess});
                res.redirect('/dashboard');


            }
            else{
                //if the password does not match. DO NOT sign the cookie. Redirect to login.
                console.log("PW AUTH FAIL");
                res.render('login',{title: 'Login', errorMessage: "That email or password does not exist in our datbase. Please enter a proper account."})

            }

           
        }

    });
    }



    Controller.prototype.logout = function(req,res){
    	//delete cookies
    	res.clearCookie('auth');
    	res.clearCookie('userID');

        //delete session
        req.session.destroy(function(err){
            if(err) return console.log(err);
        })
    	console.log("cookies cleared");
    	//render the homepage esse
    	
    	//this.render(req,"index",null,res);
    	res.redirect('/');
    }





    Controller.prototype.render = function(req,view,content,res){
    console.log("controller render invoked");
    
    console.log("req session" + JSON.stringify(req.session));
    //Check if session USER exists
    if(req.session){
    	if(req.session.user){
    		console.log("Yes session USER");
            console.log("pre-render, content = "+content);
            console.log("pre-render, session = "+JSON.stringify(req.session));

            res.render(view,{content: content, session: req.session, test: "USER"});
    		
    	//else no sesion, just do a render
    	}

        else{
            console.log("no session1");
            console.log(req.session);
            res.render(view, {content:content});
        }
    }else {
            console.log("no session2");
            console.log(req.session);
    		res.render(view, {content:content});
    	}

        console.log("End render");
}




module.exports = new Controller();