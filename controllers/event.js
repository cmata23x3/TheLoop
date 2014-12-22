// PRIMARY AUTHORS: Richard Lu, Calvin Li

var Event = require('../models/event');
var Errors = require('../errors/errors');

var EventController = {};

/**
 * Get event by id
 */
EventController.getEventById = function(eventId, callback) {
    Event.findById(eventId, function(err, event) {
        if (err) {
            return callback(Errors.events.fetch);
        }
        if (!event) {
            return callback(Errors.events.notFound);
        }

        return callback(undefined, event);
    });
};

/**
 *
 *  Create a new event.
 *
 *  @param eventData An object with fields defined as specified in models/event.js
 *  @param callback A function taking two arguments - a Mongo error object,
 *      and the ID of the created event.
 *
 **/
EventController.createEvent = function(eventData, callback) {
    
    var event = new Event(eventData);
    
    event.save(function(err, event) {
        
        if (err) {
            return callback(Errors.events.create);
        }
        
        return callback(undefined, event._id);
        
    });
    
};

/**
 *
 *  Update an event.
 *
 *  @param eventId The ObjectId of the event to update.
 *  @param updateData The data fields to update; see routes/api/events_group.js
 *  @param callback A function taking one argument, a Mongo error object.
 *      Absence of the error object indicates success.
 *
 **/
EventController.updateEvent = function(eventId, updateData, callback) {
    
    Event.findOneAndUpdate({ _id: eventId }, updateData, function(err, event) {
        
        if (err) {
            return callback(Errors.events.update);
        }
        if (!event) {
            return callback(Errors.events.notFound);
        }
        
        console.log('updatedEvent', event);
        
        return callback();
        
    });
    
};

/**
 *
 *  Delete an event.
 *
 *  @param eventId The ObjectId of the event to delete.
 *  @param callback A function taking one argument, a Mongo error object.
 *      Absence of the error object indicates success.
 *
 **/
EventController.deleteEvent = function(eventId, callback) {
    
    Event.findOneAndRemove({ _id: eventId }, function(err, event) {
        
        if (err) {
            return callback(Errors.events.delete);
        }
        if (!event) {
            return callback(Errors.events.notFound);
        }
        
        return callback();
        
    });
    
};

/**
 *
 *  Get a list events sorted by either posted or start time, grouped into
 *  sublists by day of start time.
 *  Only includes events which end after the specified searchStartTime.
 *
 *  @param sortByPostTime A boolean, true if sorted by post time.
 *  @param searchStartTime A Date object, specifies when to start searching from.
 *  @param groupId Optional, specifies which group to filter by.
 *  @param userId The user who the result will be appearing to.
 *  @param filterTags An array of tags to filter by.
 *  @param filterGenlocs An array of general locations to filter by.
 *  @param filterRsvp A boolean, whether to filter by events the user specified
 *      by userId has RSVP'd to.
 *  @param callback A function taking two arguments - a Mongo error object,
 *      and a list of events grouped by day.
 *
 **/
EventController.getGroupedEvents = function(sortByPostTime,
                                             searchStartTime,
                                             groupId,
                                             userId,
                                             filterTags,
                                             filterGenlocs,
                                             filterRsvp,
                                             callback) {
    
    var searchQuery = {};
    
    if (searchStartTime) {
        searchQuery.end = {
            $gt : searchStartTime
        };
    }
    
    if (groupId) {
        searchQuery.group = groupId;
    }
    
    if (filterTags) {
        searchQuery.tags = {
            $in : filterTags
        };
    }
    
    if (filterGenlocs) {
        searchQuery.locationGeneral = {
            $in: filterGenlocs
        };
    }
    
    if (filterRsvp) {
        searchQuery['attendees.userId'] = userId;
    }
    
    console.log('searchQuery', searchQuery);
    
    var sortQuery = sortByPostTime
        ? { posted : -1 }
        : { start : 1 };
    
    Event
        .find(searchQuery)
        .sort(sortQuery)
        .populate('group')
        .exec(function(err, events) {
            
            if (err) {
                return callback(Errors.events.fetch);
            }

            var groupedEvents = [];

            var currentDay = 0;

            for (var i=0; i<events.length; i++) {
                var event = events[i];
                
                applyVisibility(event, userId);
                
                // unique day index
                var day = event.start.getYear() * 12 * 31 + event.start.getMonth() * 31 + event.start.getDate();

                if (day !== currentDay) {
                    groupedEvents.push([ event ]);
                    currentDay = day;
                } else {
                    groupedEvents[groupedEvents.length-1].push(event);
                }
            }

            return callback(undefined, groupedEvents);
            
        });
    
};

/*
 *  Get a list events made by one group & delete all of them 
 *
 *  @param String groupId - ObjectId of group whos events are being deleted
 *  @param callback A function taking two arguments - a Mongo error object,
 *      and a list of events.
 */
EventController.deleteGroupEvents = function(groupId, callback) {
    Event
        .find({group: groupId})
        .remove(function(err, events) {
            if (err) {
                return callback(Errors.events.fetch);
            }
            else{
                return callback(undefined, events);
            }
        });
    
};

/**
 * Get all of the RSVPs for an event
 *
 * @param eventId - id of the event
 * @param userId The user who the result will be appearing to.
 * @param callback - callback called after getting RSVP, with parameters:
 *          (1) Mongo Error object
 *          (2) List of { userId, visible (for anonymity)}
 */
EventController.getRSVPsForEvent = function(eventId, userId, callback) {
    Event.findById(eventId, function(err, event) {
        if (err) {
            return callback(Errors.events.fetch);
        }
        if (!event) {
            return callback(Errors.events.notFound);
        }
        
        applyVisibility(event, userId);

        return callback(undefined, event.attendees);
    });
};

/**
 * Add RSVP for an event, or update an existing RSVP's visibility.
 *
 * @param eventId - id of the event
 * @param userId - id of the user
 * @param username - name of the user
 * @param visible - boolean if public can see user rsvp'd
 * @param callback - callback called after adding RSVP, with parameters:
 *          (1) Mongo Error object
 */
EventController.addRSVPForEvent = function(eventId, userId, username, visible, callback) {
    Event.findById(eventId, function(err, event) {
        if (err) {
            return callback(Errors.events.fetch);
        }
        if (!event) {
            return callback(Errors.events.notFound);
        }

        //Add user into list of attendees, if not there already.
        //If there, update visibility.
        var inList = false;
        for (var i = 0; i < event.attendees.length; i++) {
            var attendee = event.attendees[i];
            if (attendee.userId == userId) {
                inList = true;
                attendee.visible = visible;
            }
        }

        if (!inList) {
            event.attendees.push({ userId: userId, username: username, visible: visible });
        }

        event.save(function(err, event) {
            if (err) {
                return callback(Errors.events.save);
            }
            
            applyVisibility(event, userId);
            
            return callback(undefined, event);
        });
    });
};

/**
 * Remove RSVP for an event
 *
 * @param eventId - id of the event
 * @param userId - id of the user
 * @param callback - callback called after removing RSVP, with parameters:
 *          (1) Mongo Error object
 */
EventController.removeRSVPForEvent = function(eventId, userId, callback) {
    Event.findById(eventId, function(err, event) {
        if (err) {
            return callback(Errors.events.fetch);
        }
        if (!event) {
            return callback(Errors.events.notFound);
        }

        //Remove user from list of attendees, if not already in list
        for (var i = 0; i < event.attendees.length; i++) {
            var attendee = event.attendees[i];
            if (attendee.userId == userId) {
                event.attendees.splice(i, 1);
                break;
            }
        }

        event.save(function(err, event) {
            if (err) {
                return callback(Errors.events.save);
            }
            
            applyVisibility(event, userId);
            
            return callback(undefined, event);
        });
    });
};

/**
 * Set the imageURL for an event
 *
 * @param eventId - id of event
 * @param imageURL - image URL to set
 * @param callback - callback called after setting url, with parameters
 *              1) API Error Response
 *              2) Updated event
 */
EventController.setImageURL = function(eventId, imageURL, callback) {
    Event.findOneAndUpdate({ _id: eventId }, {imageURL: imageURL}, function(err, event) {
        if (err) {
            return callback(Errors.events.update);
        } else if (!event) {
            return callback(Errors.events.notFound);
        }

        callback(undefined, event);
    });
};

module.exports = EventController;

/* -------------- Utility Functions ------------------ */

/**
 *
 *  Anonymize an event's attendees as specified in the data;
 *  userId's of anonymous attendees who are also not the specified user
 *  are transformed to 'undefined'.
 *
 *  @param event The Event document to apply visibility to.
 *  @param userId The ID of the user who will see the result.
 *
 **/
var applyVisibility = function(event, userId) {
    
    for (var i=0; i<event.attendees.length; i++) {
        var attendance = event.attendees[i];
        
        if (!attendance.visible && attendance.userId != userId) {
            attendance.userId = undefined;
            attendance.username = undefined;
        }
    }
    
};
