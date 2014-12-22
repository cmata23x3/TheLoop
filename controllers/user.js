// PRIMARY AUTHORS: Mikael Mengistu, Christian Mata

var User = require('../models/user');
var Errors = require('../errors/errors');

/**
 * Gets the user with given userID
 * 
 * @param  userID - id of user
 * @param  callback - callback called after getting user
 */
module.exports.getUserByID = function(userID, callback) {
    User.findById(userID, function(err, user) {
        if (err) {
            return callback(Errors.users.fetch);
        }
        if (!user) {
            return callback(Errors.users.notFound);
        }
        return callback(undefined, user);
    });
};


/**
 * Gets the user with given userID
 * 
 * @param  email - email of user
 * @param  callback - callback called after getting user
 */
module.exports.getUserByEmail = function(email, callback) {
    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return callback(Errors.users.fetch);
        }
        if (!user) {
            return callback(Errors.users.notFound);
        }
        return callback(undefined, user);
    });
};


/**
 * Gets the user with given email and password
 * 
 * @param  email - email of user
 * @param  password - password of user
 * @param  callback - callback called after getting user
 */
module.exports.getUserByEmailandPassword = function(email, password, callback) {
    User.findOne({'email': email, "password": password}, function(err, user) {
        if (err) {
            return callback(Errors.users.fetch);
        }
        if (!user) {
            return callback(Errors.users.notFound);
        }
        return callback(undefined, user);
    });
};

/**
 * Gets the user with given userID and password
 * 
 * @param  userID - id of user
 * @param  password - password of user
 * @param  callback - callback called after getting user
 */
module.exports.getUserByUserIDandPassword = function(userID, password, callback) {
    User.findOne({_id: userID, "password": password}, function(err, user) {
        if (err) {
            return callback(Errors.users.fetch);
        }
        if (!user) {
            return callback(Errors.users.notFound);
        }
        return callback(undefined, user);
    });
};



/**
 * Creates a new user
 * 
 * @param  userData - object containing data for the new user (email, password  etc)
 * @param  callback - callback called after getting user
 */
module.exports.createUser = function(userData, callback) {
	var user = new User(userData);	    
	user.save(function(err, user) {
        if (err) {
            return callback(Errors.users.fetch);
        }
        return callback(undefined, user);
    });
};


/**
 * Activates a user
 * 
 * @param  userId - id of user
 * @param  callback - callback called after getting user
 */
module.exports.activateUser = function(userId, callback){

    User.update({ _id: userId}, {activated: true},{multi:false}, function(err,user){
    if(user != null){
      if (err) {
            return callback(Errors.users.fetch, user);
        }
        return callback(undefined, user);
    }    
    else{
        return callback(Errors.users.notFound,user);
    }
   }); 
}

/**
 * Delete a user
 * 
 * @param  email - email of user
 * @param  callback - callback called after getting user
 */
module.exports.deleteUser = function(email, callback){
    User.findOne( {email: email}, function(err,userToDelete){

        if (err) {
            return callback(Errors.users.fetch);
        }
        if(userToDelete != null){
            userToDelete.remove(function(err, userToDelete) {

                if (err) {
                    return callback(Errors.users.delete,userToDelete);
                }
                else {
                    return callback(undefined, userToDelete);
                }         
            });              
        }
        else{
            return callback(Errors.users.notFound,userToDelete);
        } 
    });
}

/**
 * Updates a given user's following array with a given group.
 * 
 * @param {ObjectID} userId - User's MongoDB id
 * @param {ObjectID} groupId - Group's MongoDB id
 * @param {Function} callback - function that is executed.
 */
module.exports.followGroup = function(userId, groupId, callback){
    User
    .findOneAndUpdate({_id: userId}, {$addToSet: {following: groupId}})
        .populate({
        path: 'following',
        select: {
            '_id': 1,
            'name': 1
        }
    })
    .exec(function(err, user) {
        if (err || !user) {
            return callback(Errors.users.following);
        }
        return callback(undefined, user);
    });
}

/**
 * Updates a given user's, by removing a given group from 
 * the user's following array.
 * 
 * @param {ObjectID} userId - User's MongoDB id
 * @param {ObjectID} groupId - Group's MongoDB id
 * @param {Function} callback - function that is executed.
 */
module.exports.unfollowGroup = function(userId, groupId, callback){
    User
    .findOneAndUpdate({_id: userId}, {$pull: {following: groupId}})
    .populate({
        path: 'following',
        select: {
            '_id': 1,
            'name': 1
        }
    })
    .exec(function(err, user) {
        if (err || !user) {
            return callback(Errors.users.following);
        }
        return callback(undefined, user);
    });
}
