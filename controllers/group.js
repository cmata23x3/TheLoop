// PRIMARY AUTHOR: Christian Mata

var Group = require('../models/group');
var Errors = require('../errors/errors');
var GroupController = {};

/**
* Gets all the groups that are in the database.
* 
* @param {Function} callback function that is executed.
*/
GroupController.getAllGroups = function(callback){
	Group.find({}, function(err, groups) {
		if (err) {
			return callback(Errors.groups.fetch);
		}
		return callback(undefined, groups);
	});
}

/**
* Gets the Group with given groupID
* 
* @param {ObjectID} groupId group object's MongoDB id
* @param {Function} callback function that is executed.
* @param Boolean populate optional Boolean indicating whether to populate admins
*/
GroupController.getGroupById = function(groupId, callback, populate) {
	var query = Group.findOne({_id: groupId});
	if(populate){
		query.populate({
			path: 'admins',
			select: {
				'_id': 1,
				'email': 1,
				'firstName': 1,
				'lastName': 1
			}
		});
	}
	query.exec(function(err, group) {
		if (err) {
			return callback(Errors.groups.fetch);
		}
		if (!group){
			return callback(Errors.groups.notFound);
		}
		return callback(undefined, group);
	});
}

/**
* Creates a Group instance with params given.
* 
* @param {Object} params object with params needed to make group
* @param {Function} callback function that is executed.
*/
GroupController.createGroup = function(params, callback){
	new Group(params).save(function(err, group) {
		if (err) {
			return callback(Errors.groups.create);
		}
		return callback(undefined, group);
	});
}

/**
* Deletes the Group with given groupID
* 
* @param {ObjectID} groupId group object's MongoDB id
* @param {Function} callback function that is executed.
*/
GroupController.deleteGroupById = function(groupId, callback) {
	//find events made by group & delete
	Group.findOneAndRemove({_id: groupId}, function(err, group) {
 		if (err){
 			return callback(Errors.groups.delete);
 		}
 		return callback(undefined, group);
 	});
}

/**
* Puts change to description based on the ID.
* 
* @param {ObjectID} groupId group object's MongoDB id
* @param {Object} params object with params
* @param {Function} callback function that is executed.
*/
GroupController.putGroupChangeById = function(params, callback) {
 	Group
 	.findOneAndUpdate(params.find, params.update)
 	.populate({
 		path: 'admins',
 		select: {
 			'_id': 1,
 			'email': 1,
 			'firstName': 1,
 			'lastName': 1
 		}
 	})
 	.exec(function(err, group) {
 		if (err || !group) {
 			return callback(Errors.groups.update);
 		}
 		return callback(undefined, group);
 	});
}

/**
* Delete a group admin based on the specified params.
* 
* @param {Object} params object with params
* @param {Function} callback function that is executed.
*/
GroupController.deleteGroupAdminById = function(params, callback) {
 	//method needs to check for how many are in the admins array,
 	//if admins.length>1, continue
 	//else return error
 	//get the group
 	Group.findOne(params.find, function(err, group){
 		if(err){
 			return callback(Errors.groups.fetch);
 		}
 		//check if group exists
 		if(!group){
 			return callback(Errors.groups.notFound);
 		}
 		else{
 			//now have group; check the admins length
 			if(group.admins.length>1){
			 	Group
			 	.findOneAndUpdate(params.find, params.update)
			 	.populate({
			 		path: 'admins',
			 		select: {
			 			'_id': 1,
			 			'email': 1,
			 			'firstName': 1,
			 			'lastName': 1
			 		}
			 	})
			 	.exec(function(err, group) {
			 		if (err) {
			 			return callback(Errors.groups.update);
			 		}
			 		return callback(undefined, group);
			 	});
 			}
 			else{//only 1 admin
 				return callback(Errors.groups.update);
 			}
 		}
 	});	
 }

module.exports = GroupController;
