// PRIMARY AUTHOR: Richard Lu

(function() {

    // store yet-unknown params for test URLs
    var params = {};

    // construct URL using populated params
    function buildUrl(url) {
        for (var k in params) {
            url = url.split(':'+k).join(params[k]);
        }
        return url;
    };

    // Tests!
    // @name - description of test
    // @action - GET, POST, PUT, or DELETE
    // @url - express route-style url strings
    // @body - optional, body fields
    // @check - return true if response is correct
    var tests = [
        {
            name: 'Get all groups, check for one that you admin',
            action: 'GET',
            url: '/api/groups',
            check: function(groups) {
                for (var i in groups) {
                    if (groups[i].admins.indexOf(userId) >= 0) {
                        params.groupId = groups[i]._id;
                        return true;
                    }
                }
                alert('You must admin at least 1 group!');
                return false;
            }
        },{
            name: 'Get admined group by ID',
            action: 'GET',
            url: '/api/groups/:groupId',
            check: function(group) {
                tests[3].body.description = group.description;
                return group._id === params.groupId;
            }
        },{
            name: 'Change group description',
            action: 'PUT',
            url: '/api/groups/:groupId/description',
            body: {
                description: 'HAHAHA'
            },
            check: function(group) {
                return group.description === 'HAHAHA';
            }
        },{
            name: 'Change it back',
            action: 'PUT',
            url: '/api/groups/:groupId/description',
            body: {},
            check: function(group) {
                params._origAdmins = [];
                for (var i in group.admins) {
                    params._origAdmins.push(group.admins[i]._id);
                }
                return group.description === tests[3].body.description;
            }
        },{
            name: 'Add whatshappening@mit.edu as admin',
            action: 'PUT',
            url: '/api/groups/:groupId/admin',
            body: {
                email: 'whatshappening@mit.edu'
            },
            check: function(group) {
                if (group.admins.length = params._origAdmins.length+1) {
                    for (var i in group.admins) {
                        if (params._origAdmins.indexOf(group.admins[i]._id) < 0) {
                            tests[5].body.personId = group.admins[i]._id;
                            return true;
                        }
                    }
                }
                return false;
            }
        },{
            name: 'Remove whatshappening@mit.edu as admin',
            action: 'DELETE',
            url: '/api/groups/:groupId/admin',
            body: {
                personId: ''
            },
            check: function(group) {
                if (group.admins.length === params._origAdmins.length) {
                    for (var i in group.admins) {
                        if (params._origAdmins.indexOf(group.admins[i]._id) < 0) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }
        },{
            name: 'Create event under group',
            action: 'POST',
            url: '/api/groups/:groupId/events',
            body: {
                name: 'Blah',
                description: 'bbb',
                start: Date.now(),
                end: Date.now()+2*60*60*1000,
                locationGeneral: 'West Campus',
                locationDescription: 'b',
                tags: JSON.stringify(['music'])
            },
            check: function(data) {
                params.eventId = data.eventId;
                return true;
            }
        },{
            name: 'Get all events, check new event present',
            action: 'GET',
            url: '/api/events',
            check: function(groupedEvents) {
                for (var i in groupedEvents) {
                    for (var j in groupedEvents[i]) {
                        var event = groupedEvents[i][j];
                        if (event._id === params.eventId) {
                            return event.name === 'Blah' &&
                                event.description === 'bbb' &&
                                event.locationGeneral === 'West Campus' &&
                                event.locationDescription === 'b' &&
                                event.tags.length === 1 &&
                                event.tags[0] === 'music';
                        }
                    }
                }
                return false;
            }
        },{
            name: 'RSVP to new event',
            action: 'POST',
            url: '/api/events/id/:eventId/rsvps/'+userId,
            check: function() {
                return true;
            }
        },{
            name: 'Check new RSVP present',
            action: 'GET',
            url: '/api/events/id/:eventId/rsvps/',
            check: function(rsvps) {
                for (var i in rsvps) {
                    if (rsvps[i].userId === userId) {
                        return true;
                    }
                }
                return false;
            }
        },{
            name: 'Remove RSVP',
            action: 'DELETE',
            url: '/api/events/id/:eventId/rsvps/'+userId,
            check: function() {
                return true;
            }
        },{
            name: 'Check RSVP not present',
            action: 'GET',
            url: '/api/events/id/:eventId/rsvps/',
            check: function(rsvps) {
                for (var i in rsvps) {
                    if (rsvps[i].userId === userId) {
                        return false;
                    }
                }
                return true;
            }
        },{
            name: 'Update event name',
            action: 'POST',
            url: '/api/groups/:groupId/events/:eventId',
            body: {
                name: 'Bloh'
            },
            check: function() {
                return true;
            }
        },{
            name: 'Get all events, check event updated',
            action: 'GET',
            url: '/api/events',
            check: function(groupedEvents) {
                for (var i in groupedEvents) {
                    for (var j in groupedEvents[i]) {
                        var event = groupedEvents[i][j];
                        if (event._id === params.eventId) {
                            return event.name === 'Bloh' &&
                                event.description === 'bbb' &&
                                event.locationGeneral === 'West Campus' &&
                                event.locationDescription === 'b' &&
                                event.tags.length === 1 &&
                                event.tags[0] === 'music';
                        }
                    }
                }
                return false;
            }
        },{
            name: 'Delete event',
            action: 'DELETE',
            url: '/api/groups/:groupId/events/:eventId',
            check: function() {
                return true;
            }
        },{
            name: 'Get all events, check event not present',
            action: 'GET',
            url: '/api/events',
            check: function(groupedEvents) {
                for (var i in groupedEvents) {
                    for (var j in groupedEvents[i]) {
                        var event = groupedEvents[i][j];
                        if (event._id === params.eventId) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }
    ];

    var testIndex = 0;

    var table = $('table');

    /**
     *  Run current test with its specified parameters.
     *  Upon completion, adds a row to the table.
     *  Upon success, goes on to the next test.
     *  Upon failure, terminates test.
     **/
    function runTest() {
        if (testIndex < tests.length) {
            var test = tests[testIndex];

            test.url = buildUrl(test.url);

            var row = $('<tr></tr>');
            row.append('<td class="col-md-1">'+testIndex+'</td>');
            row.append('<td class="col-md-2">'+test.name+'</td>');
            row.append('<td class="col-md-3">'+test.action+' '+test.url+'</td>');
            row.append('<td class="col-md-3">'+JSON.stringify(test.body)+'</td>');

            $.ajax({
                url: test.url,
                method: test.action,
                data: test.body,
                success: function(data) {
                    if (test.check(data)) {
                        row.addClass('success');
                        testIndex++;
                        runTest();
                    } else {
                        row.addClass('warning');
                    }
                },
                error: function(jqXHR) {
                    row.addClass('danger');
                },
                complete: function(jqXHR) {
                    row.append('<td class="col-md-3">'+jqXHR.responseText+'</td>');
                    table.append(row);
                }
            });
        }
    }

    runTest();

})();
