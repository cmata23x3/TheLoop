// PRIMARY AUTHOR: Christian Mata

var express = require('express');
var router = express.Router();
var GroupController = require('../../controllers/group');
var UserController = require('../../controllers/user');
var EventController = require('../../controllers/event');
var userAuth = require('../middleware/user_auth');
var adminAuth = require('../middleware/group_admin_auth');
var siteAdminAuth = require('../middleware/site_admin_auth');
var siteAdminRestriction = require('../middleware/site_admin_restriction');
var ObjectId = require('mongoose').Types.ObjectId;
var imageHelper = require('../../utils/image_helper');

/* POST group */
router.post('/', siteAdminAuth, function(req, res){
	res.setHeader('Content-Type', 'application/json');
	//Creating the JSON object of the new input.
	var params = {
		name: req.body.name,
		description: req.body.description,
		imageURL: req.body.imageURL || undefined,
		admins: [req.body.creator]
	};
	//Making the controller function call that'll make AJAX request.
	GroupController.createGroup(params, function(err, group){
		if(err){
			return res.status(err.status).send(err);
		}
		else{
			return res.status(200).send(group);
		}
	})
});

/* GET group listing. */
router.get('/', function(req, res){
	res.setHeader('Content-Type', 'application/json');
	//Making function call that'll make AJAX request.
	GroupController.getAllGroups(function(err, groups){
		if(err){
			return res.status(err.status).send(err);
		}
		else{
			return res.status(200).send(groups);
		}
	});
});

/* GET group by id */
router.get('/:id', function(req, res){
	res.setHeader('Content-Type', 'application/json');
	//Making function call that'll make AJAX request.
	GroupController.getGroupById(req.params.id, function(err, group){
		if(err){
			return res.status(err.status).send(err);
		}
		else{
			return res.status(200).send(group);
		}
	}, req.query.populate);
});

/* DELETE group by id */
router.delete('/:id', adminAuth, function(req, res){
	//Find events made by group & delete
	EventController.deleteGroupEvents(req.params.id, function(err, events){
		if(err){//already an error from this delete, pass it back.
			return res.status(err.status).send(err);
		}
		//delete group after 
		else{
			GroupController.deleteGroupById(req.params.id, function(err, group){
				if(err){
					return res.status(err.status).send(err);
				}
				else{
					return res.status(200).send(group);
				}
			});
		}
	})
});

/* PUT group changes */
router.put('/:id/description', adminAuth, function(req, res){
	var params = {
		find: {_id: req.params.id}, 
		update: {description: req.body.description}
	};
	//Making function call that'll make AJAX request.
	GroupController.putGroupChangeById(params, function(err, group){
		if(err){
			return res.status(err.status).send(err);
		}
		else{
			return res.status(200).send(group);
		}
	});
});

/* PUT group admin */
router.put('/:id/admin', adminAuth, function(req, res){
	res.setHeader('Content-Type', 'application/json');
	//Creating the JSON object of the new input.
	//find by id; update by adding from admin array
	//find the user by email
	UserController.getUserByEmail(req.body.email, function(err, user){
		if(err){
			return res.status(err.status).send(err);
		}
		//have the user, now add her into the admins array
		else{
			//create params
			var params = {
				find: {_id: req.params.id}, 
				update: {$addToSet: {admins: user._id}}
			};
			GroupController.putGroupChangeById(params, function(err, group){
				if(err){
					return res.status(err.status).send(err);
				}
				//successfully put new admin
				else{
					return res.status(200).send(group);
				}
			});
		}
	})
});

/* DELETE group admin */
router.delete('/:id/admin', adminAuth, function(req, res){
	res.setHeader('Content-Type', 'application/json');
	//Creating the JSON object of the new input.
	//find by id; update by removing from admin array
	var params = {
		find: {_id: req.params.id}, 
		update: {$pull: {admins: req.body.personId}}
	};

	GroupController.deleteGroupAdminById(params, function(err, group){
		if(err){
			return res.status(err.status).send(err);
		}
		else{
			return res.status(200).send(group);
		}
	});
});

module.exports = router;