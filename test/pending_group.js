// PRIMARY AUTHOR: Christian Mata
var dbURI = 'mongodb://localhost/theloop_test'
var mongoose = require('mongoose');
var should = require('should');
var UserController = require('../controllers/user');
var PendingGroupController = require('../controllers/pending_group')
var clearDB = require('mocha-mongoose')(dbURI, {noClear: true});

describe('Pending Group Controller', function(){  
	var currentUser, 
	pendingGroup;

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
	    	done();
		});
	});

	//Clear the db after tests are done
	after(function(done){
		clearDB(done);
	});

	//begin testing
	it('should create a new pending group', function(done){   
		PendingGroupController.createPendingGroup({
			name: 'Pending',
			description: 'Dummy pending group',
			creator: currentUser._id
		}, function(err, group){
			pendingGroup = group;
			group.should.be.ok;
			group.name.should.equal('Pending');
			group.description.should.equal('Dummy pending group');
			group.creator.should.equal(currentUser._id);
			done();
		});
	});

	it('should get pending groups', function(done){
		PendingGroupController.getPendingGroups(function(err, groups){
			groups.should.have.length(1);
			groups[0].name.should.equal('Pending');
			groups[0].description.should.equal('Dummy pending group');
			groups[0].creator.firstName.should.equal('John');
			done();
		});
	});

	it('should delete a pending group', function(done){
		PendingGroupController.deletePendingGroup(pendingGroup._id, function(err, group){
			//check results
			PendingGroupController.getPendingGroups(function(err, groups){
				groups.should.be.empty;
				done();
			});
		});
	});	

});