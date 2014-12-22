// PRIMARY AUTHOR: Calvin Li

var PendingGroup = require('../models/pending_group');
var Errors = require('../errors/errors');

/**
 * Gets list of pending groups
 * 
 * @param callback - callback called after getting pending groups, with parameters
 *          1) API Error Response
 *          2) List of Pending Group Objects
 */
module.exports.getPendingGroups = function(callback) {
    PendingGroup.find().populate('creator').exec(function(err, pendingGroups) {
        if (err) {
            return callback(Errors.pendingGroups.fetch);
        }

        callback(undefined, pendingGroups);
    });
}

/**
 * Creates a Pending Group document
 *
 * @params pendingGroupData - object with keys based of PendingGroup Schema
 * @params callback - callback called after creating pending group, with parameters
 *              1) API Error Response
 *              2) Pending Group Object
 */
module.exports.createPendingGroup = function(pendingGroupData, callback) {
    var pendingGroup = new PendingGroup(pendingGroupData);
    pendingGroup.save(function(err) {
        if (err) {
            return callback(Errors.pendingGroups.create);
        }

        callback(undefined, pendingGroup);
    });
}

/**
 * Deletes a Pending Group document
 *
 * @param pendingGroupId - id of pending group
 * @param callback - callback called after deleting pending group, with parameters
 *              1) API Error Response
 */
module.exports.deletePendingGroup = function(pendingGroupId, callback) {
    PendingGroup.findOneAndRemove({ _id: pendingGroupId }, function(err, pendingGroup) {
        if (err) {
            return callback(Errors.pendingGroups.delete);
        } else if (!pendingGroup) {
            return callback(Errors.pendingGroups.notFound);
        }

        callback();
    });
}