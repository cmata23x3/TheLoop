// PRIMARY AUTHOR: Richard Lu

var EventController = require('../../controllers/event');
var UserController = require('../../controllers/user');

module.exports = function(req, res) {
    
    console.log('req.query', req.query);
    
    var sortByPostedTime = req.query.sortBy === 'posted';
    var searchStartTime = new Date(parseInt(req.query.start) || 0);
    var filterTags = req.query.tags ? req.query.tags.split(',') : undefined;
    var filterGenlocs = req.query.genlocs ? req.query.genlocs.split(',') : undefined;
    var filterRsvp = req.query.rsvp === 'true';
    var filterFollowing = req.query.following === 'true';
    // see app.js: Express 4.3x quarantines req.params, thus we must
    // manually forward req.param.groupId to subsequent routers via
    // setting req.groupId
    var groupId = req.groupId;
    var userId = req.session ? req.session.userId : undefined;
    
    EventController.getGroupedEvents(
        sortByPostedTime,
        searchStartTime,
        groupId,
        userId,
        filterTags,
        filterGenlocs,
        filterRsvp,
        function(err, groupedEvents) {
            
            if (err) {
                return res.status(err.status).send(err);
            }
            
            if (filterFollowing) {
                UserController.getUserByID(userId, function(err, user) {
                    if (err) {
                        return res.status(err.status).send(err);
                    }
                    var daysToRemove = [];
                    for (var dayIndex in groupedEvents) {
                        var events = groupedEvents[dayIndex];
                        var toRemove = [];
                        for (var eventIndex in events) {
                            var event = events[eventIndex];
                            if (user.following.indexOf(event.group._id) < 0) {
                                toRemove.push(event);
                            }
                        }
                        for (var eventIndex in toRemove) {
                            events.splice(events.indexOf(toRemove[eventIndex]), 1);
                        }
                        if (events.length === 0) {
                            daysToRemove.push(events);
                        }
                    }
                    for (var dayIndex in daysToRemove) {
                        groupedEvents.splice(groupedEvents.indexOf(daysToRemove[dayIndex]), 1);
                    }
                    return res.status(200).send(groupedEvents);
                });
            } else {
                return res.status(200).send(groupedEvents);
            }
            
        });
    
};
