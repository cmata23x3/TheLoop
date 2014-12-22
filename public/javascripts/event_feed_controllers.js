// PRIMARY AUTHOR: Richard Lu

var loopApp = loopApp || angular.module('loopApp', ['ui.bootstrap']);

loopApp.controller('eventFeedController', function($scope, $rootScope) {

    $scope.userId = userId;
    $scope.userKerberos = userKerberos;
    $scope.loggedIn = userId !== undefined;
    
    $rootScope.searchStartTime = $rootScope.searchStartTime || 0;
    $rootScope.sortByPostTime = $rootScope.sortByPostTime || false;
    
    $scope.sortByPostTime = $rootScope.sortByPostTime;
    
    // reload event feed when sort is toggled
    $scope.$watch('sortByPostTime', function(sortByPostTime, old) {
        // prevent undesired initial loading
        if (sortByPostTime !== old) {
            $rootScope.sortByPostTime = sortByPostTime;
            $rootScope.loadEventFeed();
        }
    });
    
    /*----------- Utility Functions --------------------*/
    
    $rootScope.MILLISECONDS_IN_HOUR = 60 * 60 * 1000;
    $rootScope.MILLISECONDS_IN_MINUTE = 60 * 1000;

    /**
     *
     *  Get a human-readable representation of the event's attendance.
     *
     *  @param numAttendees - number of attendees going to an event
     *  @return A string representing the event's attendance.
     *
     **/
    $scope.formatAttendance = function(numAttendees) {
        if (numAttendees >= 0) {
            switch (numAttendees) {
                case 1:
                    return '1 person is going';
                case 0:
                    break;
                default:
                    return numAttendees + ' people are going';
            }
        }
        return 'No one is going yet';
    };

    /**
     *
     *  Get a human-readable list of the event's attendees.
     *
     *  @param attendees - Array of event.attendee objects for an event
     *  @param maxListed - Maximum number of usernames to list explicitly
     *  @return A string representation of the event's attendees list
     *
     **/
    $scope.formatAttendeesList = function(attendees, maxListed) {
        var names = [];

        var othersPresent = false;
        var selfPresent = false;

        for (var i in attendees) {
            // don't include self
            if ($scope.userId !== undefined && attendees[i].userId === $scope.userId) {
                selfPresent = true;
                continue;
            }

            // include names for visible people
            if (attendees[i].visible) {
                othersPresent = true;
                names.push(attendees[i].username);

                if (names.length >= maxListed) {
                    break;
                }
            }
        }

        // don't count self in remaining unlisted people
        var remaining = attendees.length - names.length - (selfPresent ? 1 : 0);

        // format unlisted count
        switch (remaining) {
            case 0:
                break;
            case 1:
                if (othersPresent) {
                    names.push('and 1 other');
                } else {
                    names.push('1 other person');
                }
                break;
            default:
                if (othersPresent) {
                    names.push('and '+remaining+' others...');
                } else {
                    names.push(remaining+' other people');
                }
                break;
        }

        return names.join(',\n');
    };
    
    /*----------- Event Handlers --------------------*/
    
    /**
     *
     *  Handler for clicking on a clickable element in an event summary box.
     *
     **/
    $('.event-feed').on('click', '.group-follow, .event-rsvp', function(e) {
        
        // Prevent detail modal display
        e.stopPropagation();
        
    });
    
    /**
     *
     *  Handler for clicking on a elements that shouldn't go anywhere.
     *
     **/
    $('.event-feed').on('click', '.ignore-link', function(e) {
        
        e.preventDefault();
        
        // hide the dropdown menu, because
        // preventDefault, which prevents the link
        // from redirecting, also prevents the
        // dropdown from disappearing
        $('body').click();
        
    });
    
    /**
     *  Handler for clicking on rsvp button in an event summary box.
     *
     **/
    $scope.toggleRSVP = function(eventId, visible) {

        if (!$scope.userId) {
            $rootScope.displayErrorOnFeed('You are not logged in!', 3000);
            return;
        }

        if ($scope.rsvpHash[eventId] !== undefined) {

            //Update DB
            $.ajax({
                url: '/api/events/id/' + eventId + '/rsvps/' + $scope.userId,
                type: 'delete'
            }).done(function() {
                delete $scope.rsvpHash[eventId];
                $scope.numAttendeesHash[eventId] -= 1;
                $scope.$apply();
            }).fail(function() {
                $rootScope.displayErrorOnFeed('Could not remove RSVP.', 3000);
            });
        } else {
            //Update DB
            $.post('/api/events/id/' + eventId + '/rsvps/' + $scope.userId, { visible: visible }).done(function() {
                $scope.rsvpHash[eventId] = visible;
                $scope.numAttendeesHash[eventId] += 1;
                $scope.$apply();
            }).fail(function() {
                $rootScope.displayErrorOnFeed('Could not RSVP.', 3000);
            });
        }
    }

    /*----------- Export Controller Functions --------------------*/
    
    /**
     *
     *  Load and display events on the feed.
     *
     **/
    $rootScope.loadEventFeed = function() {
        
        var searchStartTime = $rootScope.searchStartTime;
        var sortBy = $rootScope.sortByPostTime ? 'posted' : 'start';
        var groupId = $rootScope.filterGroupId;
        var filterRsvp = $rootScope.filterRsvp;
        var filterFollowing = $rootScope.filterFollowing;
        
        // transform filter tags and genlocs into format 'tag,tag,tag'
        var filterTags = undefined;
        if ($rootScope.filterTags && $rootScope.filterTags.length > 0 && $rootScope.filterTags.length < ALLOWED_TAGS.length) {
            filterTags = '';
            for (var k in $rootScope.filterTags) {
                filterTags += ',' + $rootScope.filterTags[k];
            }
            filterTags = filterTags.substring(1);
        }
        
        var filterGenlocs = undefined;
        if ($rootScope.filterGenlocs && $rootScope.filterGenlocs.length > 0) {
            filterGenlocs = '';
            for (var k in $rootScope.filterGenlocs) {
                filterGenlocs += ',' + $rootScope.filterGenlocs[k];
            }
            filterGenlocs = filterGenlocs.substring(1);
        }
        
        $.get('/api' + (groupId ? '/groups/'+groupId : '') + '/events'
              + '?sortBy=' + sortBy
              + '&start=' + searchStartTime
              + (filterTags ? '&tags='+filterTags : '' )
              + (filterGenlocs ? '&genlocs='+filterGenlocs : '')
              + (filterRsvp ? '&rsvp=true' : '')
              + (filterFollowing ? '&following=true' : '')
             )
            .done(function(groupedEvents) {

                $scope.rsvpHash = {};
                $scope.numAttendeesHash = {};

                for (var dayIndex in groupedEvents) {
                    for (var eventIndex in groupedEvents[dayIndex]) {
                        processIncomingEvent(groupedEvents[dayIndex][eventIndex]);
                    }
                }

                $scope.groupedEvents = groupedEvents;
                $scope.$apply();

            })
            .fail(function(jqXHR) {
                
                $rootScope.displayJqxhrErrorOnFeed(jqXHR);
                
            });
        
    };
    
    /**
     *
     *  Global scope function to apply changes to event feed.
     *
     **/
    $rootScope.updateEventFeed = function() {
        $scope.$apply();
    };
    
    /**
     *
     *  Process an event received from the server for client
     *  logic.
     *
     *  @param event An Event document received from the server.
     *
     **/
    function processIncomingEvent(event) {
        
        event.start = new Date(event.start);
        event.end = new Date(event.end);
        event.posted = new Date(event.posted);
        event.duration = new Date(
            0,0,0,
            (event.end.getTime() - event.start.getTime()) / $rootScope.MILLISECONDS_IN_HOUR,
            (event.end.getTime() - event.start.getTime()) % $rootScope.MILLISECONDS_IN_HOUR / $rootScope.MILLISECONDS_IN_MINUTE,
            0
        );

        //Count how many attendees are going to event, hash value
        $scope.numAttendeesHash[event._id] = event.attendees.length;

        //Add event to hash if user is RSVP'd to it
        for (var i = 0; i < event.attendees.length; i++) {
            var attendee = event.attendees[i];
            if ($scope.userId !== undefined && attendee.userId === $scope.userId) {
                $scope.rsvpHash[event._id] = attendee.visible;
            }
        }
    };
    
    /**
     *
     *  Display an error on the event feed.
     *
     *  @param message The message string to display.
     *  @param duration Optional; the number of milliseconds after which
     *      the error display will fade out. If ommitted, the error must
     *      be dismissed by the user.
     *
     **/
    $rootScope.displayErrorOnFeed = function(message, duration) {
        
        if (typeof duration === 'number') {
            
            var alert = $(
                '<div class="alert alert-danger" role="alert">'
                +message
                +'</div>'
            );
            $('.event-feed').prepend(alert);
            
            setTimeout(function() {
                alert.animate({
                    opacity: 0,
                    height: 0,
                    padding: 0
                },{
                    complete: function() {
                        alert.remove();
                    }
                })
            }, duration);
            
        } else {
            
            $('.event-feed').prepend(
                '<div class="alert alert-danger alert-dismissible" role="alert">'
                +'<button type="button" class="close" data-dismiss="alert">'
                +'<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>'
                +'</button>'
                +message
                +'</div>'
            );
            
        }
        
    };
    
    /**
     *
     *  Convenience function to parse and display an error from
     *  a jqXHR object.
     *
     *  @param jqXHR The jqXHR object to parse and display.
     *  @param duration See displayErrorOnFeed.
     *
     **/
    $rootScope.displayJqxhrErrorOnFeed = function(jqXHR, duration) {
        
        $rootScope.displayErrorOnFeed(JSON.parse(jqXHR.responseText).message, duration);
        
    };
    
    /*----------- Initialization --------------------*/
    
    // Load initial event feed via initialization variables
    // which may or may not have been set. If not, load all events.
    if ($rootScope.initLoadEvents) {
        $rootScope.loadEventFeed();
    }

});
