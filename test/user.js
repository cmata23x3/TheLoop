// PRIMARY AUTHOR: Christian Mata

var dbURI = 'mongodb://localhost/theloop_test'
var mongoose = require('mongoose');
var should = require('should');
var UserController = require('../controllers/user');
var GroupController = require('../controllers/group');
var clearDB = require('mocha-mongoose')(dbURI, {noClear: true});

describe('User Controller', function(){  
	var currentUser, 
	testGroup;

	//Ensure that there is a connection to the db
	beforeEach(function(done){
		if(mongoose.connection.db) return done();

		mongoose.connect(dbURI, done);
	});

	//Initialize some db instances
	before(function(done){    
	    //add some test data    
	    UserController.createUser({
	    	email: 'test@mit.edu',
	    	password: 'password',
	    	firstName: 'John',
	    	lastName: 'Doe',
	    	following: [],
	    	activated: false
	    }, function(err, user){
	    	currentUser = user;
	    	GroupController.createGroup({
	    		name: 'Test Group',
	    		description: 'Something'
	    	}, function(err, group){
	    		testGroup = group;
	    		done();
	    	});
	    });
	});

	//Clear the db after tests are done
	after(function(done){
		clearDB(done);
	});

	//Begin testing
	it('should create a new user', function(done){   
		UserController.createUser({
			email: 'test2@mit.edu',
			password: 'password',
			firstName: 'Alice',
			lastName: 'Hacker',
			following: [],
			activated: true
		}, function(err, user){
			user.email.should.equal('test2@mit.edu');
			user.password.should.equal('password');
			user.firstName.should.equal('Alice');
			user.lastName.should.equal('Hacker');
			user.following.should.be.empty;
			user.activated.should.true;
			done();
		});
	});

	it('should retrieve by email', function(done){    
		UserController.getUserByEmail('test2@mit.edu', function(err, user){      
			user.email.should.equal('test2@mit.edu');
			user.password.should.equal('password');
			user.firstName.should.equal('Alice');
			user.lastName.should.equal('Hacker');
			user.following.should.be.empty;
			user.activated.should.true;   
			done();    
		});  
	}); 

	it('should retrieve by email and password', function(done){
		UserController.getUserByEmailandPassword('test@mit.edu', 'password', function(err, user){
			user.email.should.equal('test@mit.edu');
			user.password.should.equal('password');
			user.firstName.should.equal('John');
			user.lastName.should.equal('Doe');
			user.following.should.be.empty;
			user.activated.should.false; 
			done();
		})
	});

	it('should retrieve by user id', function(done){
		UserController.getUserByID(currentUser._id, function(err, user){
			user.email.should.equal('test@mit.edu');
			user.password.should.equal('password');
			user.firstName.should.equal('John');
			user.lastName.should.equal('Doe');
			user.following.should.be.empty;
			user.activated.should.false; 
			done();
		})
	});

	it('should retrieve by id and password', function(done){
		UserController.getUserByUserIDandPassword(currentUser._id, 'password', function(err, user){
			user.email.should.equal('test@mit.edu');
			user.password.should.equal('password');
			user.firstName.should.equal('John');
			user.lastName.should.equal('Doe');
			user.following.should.be.empty;
			user.activated.should.false; 
			done();
		})
	});	

	it('should make a user active', function(done){
		UserController.activateUser(currentUser._id, function(err, user){
			user.should.equal(1); 
			done();
		})
	});	

	it('should follow a group', function(done){
		UserController.followGroup(currentUser._id, testGroup._id, function(err, user){
			user.following.should.have.length(1);
			user.following[0].name.should.equal('Test Group');
			done();
		})
	});	

	it('should unfollow a group', function(done){
		UserController.unfollowGroup(currentUser._id, testGroup._id, function(err, user){
			user.following.should.be.empty;
			done();
		})
	});	

	it('should delete a user', function(done){
		UserController.deleteUser('test@mit.edu', function(err, user){
			user.firstName.should.equal('John');
			user.lastName.should.equal('Doe');
			done();
		});
	});	
});