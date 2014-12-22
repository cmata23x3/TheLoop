// PRIMARY AUTHOR: Richard Lu

var loopApp = loopApp || angular.module('loopApp', ['ui.bootstrap']);

loopApp.controller('eventModalController', function($scope, $rootScope) {
    
    $scope.isSiteAdmin = isAdmin;
    $scope.userId = userId;
    
    $rootScope.ALLOWED_TAGS = ALLOWED_TAGS;
    
    $rootScope.ALLOWED_GENERAL_LOCATIONS = ALLOWED_GENERAL_LOCATIONS;
    
    $scope.today = new Date();
    
    /**
     *
     *  Add a tag to the specified event.
     *
     *  @param tag Tag to add
     *
     **/
    $scope.addTag = function(tag) {
        if ($scope.event.tags.indexOf(tag) < 0) {
            $scope.event.tags.push(tag);
        }
    };
    
    /**
     *
     *  Remove a tag from the specified event.
     *
     *  @param tag Tag to remove
     *
     **/
    $scope.removeTag = function(tag) {
        if ($scope.event.tags.indexOf(tag) >= 0) {
            $scope.event.tags.splice($scope.event.tags.indexOf(tag), 1);
        }
    };
    
    /**
     *
     *  Reset the selected event model to its original state.
     *
     **/
    $scope.reset = function() {
        $.extend(true, $scope.event, $scope.eventOriginal);
    };
    
    /**
     *
     *  Update the event's end time according to its start time and duration.
     *
     **/
    $scope.updateEnd = function() {
        $scope.event.end.setTime(
            $scope.event.start.getTime() +
            $scope.event.duration.getHours() * $rootScope.MILLISECONDS_IN_HOUR +
            $scope.event.duration.getMinutes() * $rootScope.MILLISECONDS_IN_MINUTE
        );
    };
    
    /**
     *
     *  Post a new event to the server with the current event
     *  data, or update the selected event.
     *
     **/
    $scope.createOrUpdateEvent = function() {
        
        processOutgoingEvent($scope.event);
        
        $('.event-post').prop('disabled', true);
        
        $.post('/api/groups/'+$scope.event.group._id+'/events/'+($scope.event._id || ''), $scope.event)
            .done(function(data) {

                if ($scope.isImageChanged) {
                    var formData = new FormData($('#eventImageHiddenForm')[0]);

                    $.ajax({
                        url: '/api/groups/' + $scope.event.group._id + '/events/id/' + ($scope.event._id || data.eventId) + '/image',
                        type: 'POST',
                        data: formData,
                        contentType: false,
                        processData: false,
                        success: function(imageURL) {
                            $rootScope.loadEventFeed();
                        },
                        error: function(jqXHR) {
                            $rootScope.displayJqxhrErrorOnFeed(jqXHR, 3000);
                        },
                        complete: function() {
                            $scope.isImageChanged = false;
                        }
                    });
                } else {
                    $rootScope.loadEventFeed();
                }
                
            })
            .fail(function(jqXHR) {
                
                $rootScope.displayJqxhrErrorOnFeed(jqXHR, 3000);
                
            })
            .always(function() {

                $('.event-post').prop('disabled', false);
                $('#eventModal').modal('hide');
                
            });
        
    };
    
    /**
     *
     *  Delete the currently displayed event.
     *
     **/
    $scope.deleteEvent = function() {
        
        if (window.confirm('Are you sure you want to cancel this event? '
                           +'This cannot be undone!')) {

            $('.event-cancel').prop('disabled', true);

            $.ajax({
                url: '/api/groups/'+$scope.event.group._id+'/events/'+$scope.event._id,
                type: 'DELETE',
            }).done(function() {

                $rootScope.loadEventFeed();

            }).fail(function(jqXHR) {

                $rootScope.displayJqxhrErrorOnFeed(jqXHR, 3000);

            }).always(function() {

                $('.event-cancel').prop('disabled', false);
                $('#eventModal').modal('hide');

            });

        }
        
    };
    
    /**
     *
     *  Process a client event object for sending to server.
     *
     *  @param event A client event object.
     *
     **/
    function processOutgoingEvent(event) {
        
        event.start = event.start.getTime();
        event.end = event.end.getTime();
        // Can only send primitive fields through request body,
        // must stringify here then parse on server.
        event.tags = JSON.stringify(event.tags);
        event.attendees = JSON.stringify(event.attendees);
        // wait for callback to upload image
        delete event.imageURL;
        
    };
    
    /*----------- Event Handlers --------------------*/

    var imageFileInput = $('#eventImageHiddenInput');

    /**
     *
     *  Redirect user click to hidden file input on main
     *  feed, because file inputs in Bootstrap modals
     *  don't seem to launch the file browser.
     *
     **/
    $('.event-image-input').click(function() {
        imageFileInput.click();
    });

    /**
     *
     *  Handler for loading a new image file.
     *  Sets the background image in the modal for preview.
     *
     **/
    var fileReader = new FileReader();
    fileReader.onload = function() {
        if (fileReader.result != null) {
            $scope.event.imageURL = fileReader.result;
            $scope.$apply();
        }
    };

    /**
     *
     *  Handler for selecting a new image file.
     *  Notifies the file reader of the change.
     *
     **/
    imageFileInput.change(function() {
        fileReader.readAsDataURL(imageFileInput[0].files[0]);
        $scope.isImageChanged = true;
    });

    /**
     *
     *  Handler for showing the modal.
     *
     **/
    $('#eventModal').on('show.bs.modal', function() {
        
        $rootScope.toggleTimeEditor(false);
        $rootScope.updateEventDetailView();
        
    });
    
    /**
     *
     *  Prevent certain a elements from redirecting
     *
     **/
    $('#eventModal').click('.event-allowed-tag, .event-cancel', function(e) {
        e.preventDefault();
    });
    
    /**
     *
     *  Handler for clicking on Edit button.
     *
     **/
    $('.event-edit').click(function() {
        
        $rootScope.showEventDetailInputs();
        $rootScope.toggleTimeEditor(false);
        
    });
    
    /**
     *
     *  Handler for clicking on Cancel button.
     *
     **/
    $('.event-edit-cancel').click(function() {
        
        if ($rootScope.isNewEvent) {
            
            $('#eventModal').modal('hide');
            
        } else {
            
            $rootScope.hideEventDetailInputs();
            $rootScope.toggleTimeEditor(false);
            $scope.$apply();
            
        }
        
    });

    /*----------- Export Controller Functions --------------------*/
    
    /**
     *
     *  Show only non-modifiable fields in event modal.
     *
     **/
    $rootScope.hideEventDetailInputs = function() {
        $('#eventModal').removeClass('editing');
        $('#eventModal').addClass('not-editing');
    };
    
    /**
     *
     *  Show only modifiable fields in event modal.
     *
     **/
    $rootScope.showEventDetailInputs = function() {
        $('#eventModal').addClass('editing');
        $('#eventModal').removeClass('not-editing');
    };
    
    /**
     *
     *  Toggle the visibility of the time editor popup.
     *  If a boolean parameter is passed in, the visibility
     *  will be set accordingly, unconditionally.
     *  Else, the visibility will be set to hidden if the
     *  modal is not in edit mode; otherwise, the visibility
     *  is toggled.
     *
     *  @param show A boolean, optional, explicitly sets the
     *      visibility state.
     *
     **/
    $rootScope.toggleTimeEditor = function(show) {
        var timeEditor = $('.event-time-input');
        
        if (show !== undefined) {
            if (show) {
                timeEditor.removeClass('hidden');
            } else {
                timeEditor.addClass('hidden');
            }
        } else {
            if ($('#eventModal').hasClass('not-editing')) {
                timeEditor.addClass('hidden');
            } else {
                timeEditor.toggleClass('hidden');
            }
        }
    };
    
    /**
     *
     *  Update the Event document to display; pass in a group
     *  object instead to create a new event under that group.
     *
     *  @param eventOrGroup An event or group object. If event,
     *      update the event data to display; if group, set the
     *      event data to a blank new event under that group.
     *
     **/
    $rootScope.updateEventDetailData = function(eventOrGroup) {
        
        var event = eventOrGroup;
        var group = eventOrGroup;
        
        if (event.group === undefined) {
            // is group object, create new event
            
            $rootScope.isNewEvent = true;
            
            var now = Date.now();
            
            event = {
                name: '',
                group: group,
                description: '',
                start: new Date(now),
                end: new Date(now + 2 * $rootScope.MILLISECONDS_IN_HOUR),
                duration: new Date(0,0,0,2,0,0,0),
                locationGeneral: $rootScope.ALLOWED_GENERAL_LOCATIONS[0],
                locationDescription: '',
                tags: [],
                attendees: []
            };
            
            $rootScope.showEventDetailInputs();
            
        } else {
            
            group = event.group;
            
            $rootScope.isNewEvent = false;
            $rootScope.hideEventDetailInputs();
            
        }
        
        $scope.isAdmin = $scope.isSiteAdmin || group.admins.indexOf($scope.userId) >= 0;
        
        $scope.eventOriginal = event;
        $scope.event = $.extend(true, {}, event);
    };
    
    /**
     *
     *  Update the Event document view.
     *
     **/
    $rootScope.updateEventDetailView = function() {
        $scope.$apply();
    };

});
