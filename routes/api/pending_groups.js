// PRIMARY AUTHOR: Calvin Li

var express = require('express');
var router = express.Router();
var PendingGroupController = require('../../controllers/pending_group');
var siteAdminAuth = require('../middleware/site_admin_auth');
var siteAdminRestriction = require('../middleware/site_admin_restriction');

/**
 * GET pending groups
 *
 * Only gets the groups that are in the "PENDING" status (ignoring
 * those that are already accepted or denied)
 *
 * @return
 *      Array of Pending Group Objects
 */
router.get('/', siteAdminAuth, function(req, res) {
    PendingGroupController.getPendingGroups(function(err, pendingGroups) {
        if (err) {
           return res.status(err.status).send(err);
        }

        res.status(200).send(pendingGroups.map(function(pendingGroup) {
            var creator = pendingGroup.creator;
            var creatorData = {
                _id: creator._id,
                name: creator.firstName + ' ' + creator.lastName,
                email: creator.email
            }
            
            return {
                _id: pendingGroup._id,
                name: pendingGroup.name,
                description: pendingGroup.description,
                creator: creatorData
            }
        }));
    });
});

/**
 * POST new pending group
 *
 *  @body
 *      name: String
 *      description: String
 *      creator: userId
 *  @return
 *      eventId: ObjectID of the created pending group
 */
router.post('/', siteAdminRestriction, function(req, res) {
    var pendingGroupData = {
        name: req.body.name,
        description: req.body.description,
        creator: req.body.creator
    }

    PendingGroupController.createPendingGroup(pendingGroupData, function(err, pendingGroup) {
        if (err) {
            return res.status(err.status).send(err);
        }

        res.status(200).send({ pendingGroupId: pendingGroup._id });
    });
});

/**
 * DELETE pending group
 *
 * @return
 *      deleted: boolean if pending group was deleted
 */
router.delete('/:pendingGroupId', siteAdminAuth, function(req, res) {
    var pendingGroupId = req.params.pendingGroupId;

    PendingGroupController.deletePendingGroup(pendingGroupId, function(err) {
        if (err) {
            return res.status(err.status).send(err);
        }

        res.status(200).send({});
    });
});

module.exports = router;