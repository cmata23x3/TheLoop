// PRIMARY AUTHOR: Mikael Mengistu

var express = require('express');
var router = express.Router();
var UserController = require('../../controllers/user');
var Errors = require('../../errors/errors');
var Mailgun = require('mailgun-js');



//Your api key, from Mailgun’s Control Panel
var API_KEY = 'key-bd0c2523075af44263f2d2f6d5ba3b03';

//Your DOMAIN, from the Mailgun Control Panel
var DOMAIN = 'sandbox4d8615c0048442df85eab75f48238fbd.mailgun.org';

//Your sending email address
var FROM_WHO = 'theloop@mit.edu';

//Site Admin Information
var SITE_ADMIN_EMAIL = 'siteadmin@mitloop.com';
var SITE_ADMIN_PASSWORD = '1cedteamango!';

/* POST login request */
/*
@action
    Login 
@request
    GET /users/login
@response
    redirects to homepage
@error    
    No User Error
    Account Not Activated Error
    DatabaseError

*/
router.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    //Check if logging in as site admin
    if (email === SITE_ADMIN_EMAIL && password === SITE_ADMIN_PASSWORD) {
        //Set session
        req.session.name = email;
        req.session.userId = "1234567890";
        req.session.isAdmin = true;

        //Redirect
        res.redirect('/');
        return;
    }


    UserController.getUserByEmailandPassword(email, password, function(err, matchedUser){
        if (err) {
            return res.redirect('/?error=noUser');
        }   

        if (matchedUser !== null){

            if(matchedUser.activated == true){
                req.session.name = email;
                req.session.userId = matchedUser._id;
                req.session.isAdmin = false;
                res.redirect('/');
                return;
            }
            else {
                res.redirect('/?error=accountNotActivated');
            }
        }       
        else{
            return res.redirect('/?error=badlogin');
        }

    });

});

/* POST to Add User to TheLoop */
/*
@action 
    Create a new user
@request    
    POST /users
@response
    redirects to verification email route users/submit/:mail
@error    
    User Already Exists

*/
router.post('/', function(req, res) {

    // Get our form values. These rely on the "name" attributes
    var email = req.body.email;
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;

    var UserData = {
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName :req.body.lastName,
        activated: false
    };

    UserController.getUserByEmail(email, function(err,existingUser){
        if (existingUser == null) {
            UserController.createUser(UserData, function(err, user) {
                if (err) {
                    return res.status(err.status).send(err);
                }       
                req.session.name = email;
                req.session.userId = user._id;
                res.redirect('/api/users/submit/:mail');

            });
            
        }
        else {
            
            return res.redirect('/?error=userAlreadyExists');
            
        }
    });

});



// Send a message to the specified email address when you navigate to /submit/someaddr@email.com
// The index redirects here
/*
@action
    Send Verification Email
@request
    GET users/submit/:mail
@response
    redirect to homepage
@error    
    Mailgun server error
*/
router.get('/submit/:mail', function(req,res) {

        //We pass the API_KEY and DOMAIN to the wrapper, or it won't be able to identify + send emails
        var mailgun = new Mailgun({apiKey: API_KEY, domain: DOMAIN});
        var link = req.headers.host+'/api/users/'+req.session.userId +'/verify';
        var data = {
        //Specify email data
          from: FROM_WHO,
        //The email to contact
          to: req.session.name,
        //Subject and text data  
          subject: 'Verify Your Email Address',
          html: 'Hey! Welcome to <b>The Loop</b>! Click on the link to verify your email address.  <a href="'+req.headers.host+'/api/users/' +req.session.userId  +'/verify">The Loop Link</a> <br><br> If the link does not work, please enter into your browser: <br>' + link
        }

        //Invokes the method to send emails given the above data with the helper library
        mailgun.messages().send(data, function (err, body) {
            //If there is an error, render the error page
            if (err) {
                res.render('error', { page: 'error', error : err});
            }
            else {
                req.session.destroy();
                res.redirect('/');
                
            }
        });

    });

/* GET logout and go to  home page. */
/*
@action
    Logs a user out
@request
    POST users/logout
@response    
    redirects to homepage and destroys session

*/
router.post('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

/*
@action
    Gets the verify account page
@request     
    GET users/:userId/verify
@response
    Sends the user to the verify account page

*/
router.get('/:userId/verify', function(req, res){
     req.session.userID = req.params.userId;
     res.render('verify',  { title: 'The Loop', page: 'verify', session: req.session });

});

/*
@action
    Attempts to verify account associated with userId
@request
    POST users/:userId/verify
@response
    Redirects to homepage
@error
    No User Error
    Database Error

*/
router.post('/:userId/verify', function(req, res){
     var userId = req.params.userId;  
     var password = req.body.password;

     UserController.getUserByID(userId, function(err,existingUser){
          if (existingUser == null) {
            //Wrong password
            res.redirect('/?error=noAccount');            
        }
        else {
            UserController.activateUser(userId,function(err,existingUser){
                res.redirect('/');
            });
            
            }
     });
});

/*
@action
    Sends password to user
@request
    POST users/sendPassword
@response
    Redirects to homepage
@error
    No User Error
    Database Error
    Mailgun Server Error

*/
router.post('/sendPassword', function(req,res){

     var email = req.body.email;
     
     UserController.getUserByEmail(email,function(err,currentUser){

        if(err){
            return res.redirect('/?error=noUser');
        }
        else{
        
        //We pass the API_KEY and DOMAIN to the wrapper, or it won't be able to identify + send emails
        var mailgun = new Mailgun({apiKey: API_KEY, domain: DOMAIN});

        var data = {
        //Specify email data
          from: FROM_WHO,
        //The email to contact
          to: email,
        //Subject and text data  
          subject: 'Your Password',
          html: 'Hey! Here is your password for <b>The Loop<b> <br>' + currentUser.password  
        }

        //Invokes the method to send emails given the above data with the helper library
        mailgun.messages().send(data, function (err, body) {
            //If there is an error, render the error page
            if (err) {
                return res.status(err.status).send(err);
            }      
            else {           
                res.redirect('/');
                }
            });
        }
    });
});

/*
@action
    Deletes user account
@request
    POST users/delete
@response
    Redirects to homepage
@error    
    No User Error
    Database Error

*/
router.post('/delete', function(req,res){
    UserController.deleteUser(req.session.name,function(err,currentUser){
        if(err){
            return res.status(err.status).send(err);
        }
    });
    req.session.destroy();
    res.redirect('/');
});

/* GET User instance by id */
router.get('/:id', function(req, res){
    UserController.getUserByID(req.params.id, function(err, user){
        if (err) {
            return res.status(err.status).send(err);
        }
        else{
            return res.status(200).send(user);
        }
    });
});

//**** Following Routes *****//

/* POST following group into User's following array */
router.post('/:id/following/:gid', function(req, res) {
    UserController.followGroup(req.params.id, req.params.gid, function(err, user){
        if(err){
            return res.status(err.status).send(err);
        }
        else{
            return res.status(200).send(user);
        }
    })
});

/* DELETE following group from User's following array */
router.delete('/:id/following/:gid', function(req, res) {
    UserController.unfollowGroup(req.params.id, req.params.gid, function(err, user){
        if(err){
            return res.status(err.status).send(err);
        }
        else{
            return res.status(200).send(user);
        }
    })
});

module.exports = router;
