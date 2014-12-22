// PRIMARY AUTHOR: Richard Lu, Calvin Li

var express = require('express');
var router = express.Router();
var EventController = require('../../controllers/event');
var GroupController = require('../../controllers/group');
var Errors = require('../../errors/errors');
var getFilteredEvents = require('../middleware/get_filtered_events');
var siteAdminRestriction = require('../middleware/site_admin_restriction');
var userAuth = require('../middleware/user_auth');
var groupAdminAuth = require('../middleware/group_admin_auth');
var ObjectId = require('mongoose').Types.ObjectId;
var imageHelper = require('../../utils/image_helper');

// All routes below have access to param field groupId via req.groupId

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
 *
 *  POST new event
 *
 *  @body
 *      name: String
 *      description: String
 *      start: Date number
 *      end: Date number
 *      locationGeneral: String
 *      locationDescription: String
 *      tags: [ String ]
 *      attendees: [ String ]
 *  @return
 *      eventId: ObjectID of the created event
 *
 **/

router.post('/', groupAdminAuth, siteAdminRestriction, function(req, res) {
    
    console.log('req.body', req.body);
    
    var userId = req.session.userId;
    var groupId = req.groupId;

    var eventData = {
        name: req.body.name,
        group: groupId,
        description: req.body.description,
        start: req.body.start,
        end: req.body.end,
        locationGeneral: req.body.locationGeneral,
        locationDescription: req.body.locationDescription,
        // Can only send primitive fields through request body,
        // must stringify arrays on client then parse here.
        tags: JSON.parse(req.body.tags || '[]'),
        attendees: []
    };

    EventController.createEvent(eventData, function(err, eventId) {

        if (err) {
            return res.status(err.status).send(err);
        }

        return res.status(200).send({
            eventId: eventId
        });

    });

});

/**
 * POST add image to event
 *
 * @body
 *      image - image file
 * @return
 *      imageURL - url of uploaded image
 */
router.post('/id/:eventId/image', groupAdminAuth, siteAdminRestriction, function(req, res) {
    var eventId = req.params.eventId;

    if (!ObjectId.isValid(eventId)) {
        return res.status(400).send(Errors.events.notFound);
    }

    EventController.getEventById(eventId, function(err, event) {
        if (err) {
            return res.status(err.status).send(err);
        }

        //Define function for uploading image and setting image url in db
        var setUpImage = function() {
            imageHelper.uploadImage(req, 'events', eventId, function(err, fileName) {
                if (err) {
                    return res.status(err.status).send(err);
                }

                var imageURL = imageHelper.createImageURL('events', eventId, fileName);

                //Set imageURL in database
                EventController.setImageURL(eventId, imageURL, function(err) {
                    if (err) {
                        return res.status(err.status).send(err);
                    }

                    return res.status(200).send({ imageURL: imageURL })
                });
            });
        }

        //delete image in directory if necessary
        if (event.imageURL && event.imageURL.length > 0) {
            var urlSplit = event.imageURL.split('/');
            var fileName = urlSplit[urlSplit.length - 1];
            imageHelper.deleteImage('events', eventId, fileName, setUpImage);
        } else {
            setUpImage();
        }
    });
});

/**
 *
 *  Edit an event.
 *
 *  @params
 *      eventId: ObjectId
 *  @body (all optional)
 *      name: String
 *      description: String
 *      locationGeneral: String
 *      locationDescription: String
 *      start: Date number
 *      end: Date number
 *      tags: [ String ]
 *  @return
 *      {}
 *
 **/
router.post('/:eventId', groupAdminAuth, function(req, res) {
    
    // fields to consider for update,
    // true if content requires JSON.parse
    var updateDataTemplate = {
        name: false,
        description: false,
        locationGeneral: false,
        locationDescription: false,
        start: false,
        end: false,
        tags: true
    };
    
    var updateData = {};
    
    for (var k in updateDataTemplate) {
        if (req.body[k]) {
            if (updateDataTemplate[k]) {
                // possible for user to upload an Object as tags
                // rather than an array, but there's only so much
                // they can do with such an object ($addToSet, etc.)
                // not a big concern
                updateData[k] = JSON.parse(req.body[k]);
            } else {
                updateData[k] = req.body[k];
            }
        }
    }
    
    EventController.updateEvent(req.params.eventId, updateData, function(err) {
        if (err) {
            return res.status(err.status).send(err);
        }
        return res.status(200).send({});
    });
    
});

/**
 *
 *  DELETE an event.
 *
 *  @params
 *      eventId: ObjectId
 *  @return
 *      {}
 *
 **/
router.delete('/:eventId', groupAdminAuth, function(req, res) {
    
    EventController.deleteEvent(req.params.eventId, function(err) {
        if (err) {
            return res.status(err.status).send(err);
        }
        return res.status(200).send({});
    });
    
});

module.exports = router;
