// PRIMARY AUTHOR: Christian Mata
var dbURI = 'mongodb://localhost/theloop_test'
var mongoose = require('mongoose');
var should = require('should');
var UserController = require('../controllers/user');
var GroupController = require('../controllers/group');
var clearDB = require('mocha-mongoose')(dbURI, {noClear: true});

mongoose.connect(dbURI);

describe('Group Controller', function(){  
	var currentUser, 
	otherUser,
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
	    		description: 'Something',
	    		admins: []
	    	}, function(err, group){
	    		testGroup = group;
	    		UserController.createUser({
	    			email: 'test2@mit.edu',
	    			password: 'password',
	    			firstName: 'Alice',
	    			lastName: 'Hacker',
	    			following: [],
	    			activated: true
	    		}, function(err, user2){
	    			otherUser = user2;
	    			done();
	    		});
	    	});
	    });
	});

	//Clear the db after tests are done
	after(function(done){
		clearDB(done);
	});

	//begin testing
	it('should create a new group', function(done){   
		GroupController.createGroup({
			name: 'Dummy Group',
			description: 'This is another testing group'
		}, function(err, group){
			group.name.should.equal('Dummy Group');
			group.description.should.equal('This is another testing group');
			done();
		});
	});

	it('should retrieve all groups', function(done){    
		GroupController.getAllGroups(function(err, groups){      
			groups.should.have.length(2);
			groups[0].should.be.an.Object;
			groups[1].should.be.an.Object;
			done();    
		});  
	}); 

	it('should retrieve group by id', function(done){
		GroupController.getGroupById(testGroup._id, function(err, group){
			group.name.should.equal('Test Group');
			group.description.should.equal('Something');
			done();
		})
	});

	it('should put change by id', function(done){
		//create the paramsters for admin puts
		var params = {
			find: {_id: testGroup._id},
			update: {$addToSet: {admins: currentUser._id}}
		};
		var params2 = {
			find: {_id: testGroup._id},
			update: {$addToSet: {admins: otherUser._id}}
		};
		//make the controller calls
		GroupController.putGroupChangeById(params, function(err, group){
			group.admins.should.have.length(1);
			group.admins[0].firstName.should.equal(currentUser.firstName)
			GroupController.putGroupChangeById(params2, function(err, group){
				group.admins.should.have.length(2);
				group.admins[1].firstName.should.equal(otherUser.firstName)
				done();
			});
		});
	});

	it('should remove admin', function(done){
		var params = {
			find: {_id: testGroup._id},
			update: {$pull: {admins: currentUser._id}}
		};
		GroupController.deleteGroupAdminById(params, function(err, group){
			group.admins.should.have.length(1);
			//should have only the other user
			group.admins[0].firstName.should.equal('Alice');
			done();
		})
	});	

	it('should delete a group', function(done){
		GroupController.deleteGroupById(testGroup._id, function(err, group){
			group.name.should.equal('Test Group');
			group.description.should.equal('Something');

		});
		GroupController.getGroupById(testGroup._id, function(err, group){
			err.should.be.an.Object;
			done();
		})
	});	
});