// PRIMARY AUTHOR: Christian Mata
var dbURI = 'mongodb://localhost/theloop_test'
var mongoose = require('mongoose');
var should = require('should');
var UserController = require('../controllers/user');
var GroupController = require('../controllers/group');
var EventController = require('../controllers/event');
var clearDB = require('mocha-mongoose')(dbURI, {noClear: true});

describe('Event Controller', function(){  
	var currentUser, 
	otherUser,
	eventId,
	testEvent,
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
	it('should create a new event', function(done){   
		EventController.createEvent({
			name: 'New Event',
			group: testGroup._id,
			description: 'New event happening!',
			start: '2014-12-07T23:00:54.913Z',
			end: '2014-12-08T01:00:54.913Z',
			locationGeneral: 'Student Center',
			locationDescription: 'West Campus'
		}, function(err, event){
			(event).should.be.ok;
			eventId = event;
			done();
		});
	});

	it('should get events', function(done){
		EventController.getGroupedEvents(false, null, null, null, null, null, null, function(err, events){
			events.should.have.length(1);
			events[0].should.have.length(1);
			events[0][0].name.should.equal('New Event');
			events[0][0].description.should.equal('New event happening!');
			done();
		});
	});

	it('should update event', function(done){   
		var update = {
			description: 'Updated!'
		}
		EventController.updateEvent(eventId, update, function(err, event){      
			EventController.getGroupedEvents(false, null, null, null, null, null, null, function(err, events){
				events.should.have.length(1);
				events.should.have.length(1);
				events[0].should.have.length(1);
				events[0][0].name.should.equal('New Event');
				events[0][0].description.should.equal('Updated!');
				done();
			});  
		});  
	}); 

	it('should add RSVP for event', function(done){
		EventController.addRSVPForEvent(eventId, currentUser._id, 'test', true, function(err, event){
			event.name.should.equal('New Event');
			event.attendees.should.have.length(1);
			event.attendees[0].userId.should.equal(currentUser._id);
			event.attendees[0].visible.should.be.true;
			done();
		})
	});

	it('should get RSVP for event', function(done){
		EventController.getRSVPsForEvent(eventId, currentUser._id, function(err, attendees){
			attendees.should.have.length(1);
			attendees[0].visible.should.be.true;
			done();
		})
	});

	it('should remove RSVP for event', function(done){
		EventController.removeRSVPForEvent(eventId, currentUser._id.toString(), function(err, event){
			event.name.should.equal('New Event');
			event.attendees.should.be.empty;
			done();
		});
	});

	it('should delete the event', function(done){
		EventController.deleteGroupEvents(testGroup._id, function(err, events){
			//check the resulting events
			EventController.getGroupedEvents(false, null, null, null, null, null, null, function(err, events){
				events.should.be.empty;
				done();
			}); 
		});
	});	

});