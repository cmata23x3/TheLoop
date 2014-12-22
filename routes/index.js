// PRIMARY AUTHOR: Mikael Mengistu, Richard Lu

var express = require('express');
var router = express.Router();
var UserController = require('../controllers/user');

/* GET home page. */
router.get('/', function(req, res) {
    
    var error;
    switch (req.query.error) {
        case 'badlogin':
            error = 'Email or password does not match';
            break;
        case 'accountNotActivated':
            error = 'The account associated with this email address has not been activated yet';
            break;
        case 'noAccount':
            error = 'Verification failed';
            break;
        case 'userAlreadyExists':
            error = 'An account with that email address has already been created!';
            break;
        case 'noUser':
            error = 'There is no user associated with that email address!';
            break;

    }
    
    res.render('index', { title: 'The Loop', page: 'home', session:req.session, error: error });
});

router.get('/signup', function(req, res) {
    res.render('signup', { title: 'The Loop', page: 'signup', session: req.session });
});

router.get('/groups', function(req, res){
	res.render('groups', { title: 'The Loop', page: 'groups', session: req.session});
});

router.get('/groups/:id', function(req, res){
	res.render('group', {title: 'The Loop', page: 'groups', session: req.session});
});
router.get('/settings', function(req, res){
    if (req.session.name === undefined){
        res.redirect('/');
    }
    else{
        res.render('settings', { title: 'The Loop', page: 'settings', session: req.session});
    }
});
router.get('/send_password', function(req, res){
    res.render('send_password', { title: 'The Loop', page: 'send_password', session: req.session});
});

router.get('/image_test', function(req, res) {
    res.render('image_test', {title: 'The Loop', page: 'image_test', session: req.session});
});

router.get('/pending_groups', function(req, res) {
    res.render('pending_groups', {title: 'The Loop', page: 'pending_groups', session: req.session})
});

router.get('/tests', function(req, res) {
    if (req.session && req.session.name && !req.session.isAdmin) {
        res.render('tests', {title: 'API Testing', page: 'tests', session: req.session});
    } else {
        res.redirect('/');
    }
});

module.exports = router;
