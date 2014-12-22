// PRIMARY AUTHOR: Calvin Li

var express = require('express');
var router = express.Router();
var EventController = require('../../controllers/event');
var GroupController = require('../../controllers/group');
var UserController = require('../../controllers/user');
var Errors = require('../../errors/errors');
var getFilteredEvents = require('../middleware/get_filtered_events');
var siteAdminRestriction = require('../middleware/site_admin_restriction');
var userAuth = require('../middleware/user_auth');

/**
 *
 *  GET events
 *
 *  @queries
 *      sortBy - one of 'posted' or 'start', determines which event time
 *          field to sort by.
 *      start - Date number (milliseconds), when to start searching.
 *  @return
 *      An array of arrays - each array contains a list of events
 *      which all start on the same day, sorted by either posted time
 *      or start time.
 *
 **/
router.get('/', getFilteredEvents);

/**
 * GET RSVPs for an event
 *
 * @return
 *      list of objects with notation: 
 *      {
 *          userId: [ObjectId]
 *          visible: [Boolean]
 *      }
 */
router.get('/id/:eventId/rsvps', function(req, res) {
    var eventId = req.params.eventId;
    var userId = req.session ? req.session.userId : undefined;
    EventController.getRSVPsForEvent(eventId, userId, function(err, attendees) {
        if (err) {
            return res.status(err.status).send(err);
        }

        return res.status(200).send(attendees);
    });
});

/**
 * POST new RSVP for event
 *
 * @body
 *      visible (optional) - whether RSVP can be visible in public (kerberos)
 * @return
 *      {}
 *
 */
router.post('/id/:eventId/rsvps/:userId', userAuth, siteAdminRestriction, function(req, res) {
    var eventId = req.params.eventId;
    var userId = req.params.userId;
    var visible = req.body.visible || true;

    //Can only rsvp if userId is equal to session userId
    if (userId != req.session.userId) {
        return res.status(401).send(Errors.unauthorized);
    }
    
    UserController.getUserByID(userId, function(err, user) {
        if (err) {
            return res.status(err.status).send(err);
        }

        // remove @mit.edu
        var username = user.email.substring(0, user.email.length-8);

        EventController.addRSVPForEvent(eventId, userId, username, visible, function(err) {
            if (err) {
                return res.status(err.status).send(err);
            }

            res.status(200).send({});
        });
    });
    
});

/**
 * DELETE a RVSP for event
 *
 * @return
 *      {}
 */
router.delete('/id/:eventId/rsvps/:userId', userAuth, siteAdminRestriction, function(req, res) {
    var eventId = req.params.eventId;
    var userId = req.params.userId;

    //Can only un-rsvp if userId is equal to session userId
    if (userId != req.session.userId) {
        return res.status(401).send(Errors.unauthorized);
    }

    EventController.removeRSVPForEvent(eventId, userId, function(err) {
        if (err) {
            return res.status(err.status).send(err);
        }

        res.status(200).send({});
    });
});

module.exports = router;
