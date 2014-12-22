// PRIMARY AUTHOR: Calvin Li

var loopApp = loopApp || angular.module('loopApp', ['ui.bootstrap']);

loopApp.controller('pendingGroupsCtrl', function($scope) {
    $scope.pendingGroups = [];
    $scope.errorMsg = undefined;
    $scope.successMsg = undefined;

    /*----------------- Controller functions -----------------*/

    /**
     * Get pending groups
     */
    $scope.getPendingGroups = function() {
        $.get('/api/pending_groups').done(function(pendingGroups) {
            $scope.pendingGroups = pendingGroups;
            $scope.$apply();
        }).fail(function(jqXHR) {
            displayError(JSON.parse(jqXHR.responseText).message, 0);
        });
    }

    /**
     * Approves pending group by deleting the pending group in database
     * and creates new group
     *
     * @param pendingGroupId - id of pending group
     */
    $scope.approvePendingGroup = function(pendingGroupId) {
        $.ajax({
            url: '/api/pending_groups/' + pendingGroupId,
            type: 'delete'
        }).done(function() {
            //Find pending group to create new group
            for (var i = 0; i < $scope.pendingGroups.length; i++) {
                var pendingGroup = $scope.pendingGroups[i];
                if (pendingGroup._id == pendingGroupId) {
                    //Create group data
                    var groupData = {
                        name: pendingGroup.name,
                        description: pendingGroup.description,
                        creator: pendingGroup.creator._id
                    }

                    //Update list of pending groups
                    $scope.pendingGroups.splice(i, 1);
                    $scope.$apply();

                    //Make request to create group
                    $.post('/api/groups', groupData).done(function() {
                        displaySuccess("Group created successfully", 3000);
                    }).fail(function() {
                        displayError(JSON.parse(jqXHR.responseText).message, 3000);
                    });

                    return;
                }
            }

            //Only gets here if could not find in array
            displayError("Could not find pending group, please try again", 3000);
        }).fail(function(jqXHR) {
            displayError(JSON.parse(jqXHR.responseText).message, 3000);
        });
    }

    /**
     * Denies pending group by deleting the pending group in database
     *
     * @param pendingGroupId - id of pending group
     */
    $scope.denyPendingGroup = function(pendingGroupId) {
        $.ajax({
            url: '/api/pending_groups/' + pendingGroupId,
            type: 'delete'
        }).done(function() {
            //Find pending group
            for (var i = 0; i < $scope.pendingGroups.length; i++) {
                var pendingGroup = $scope.pendingGroups[i];
                if (pendingGroup._id == pendingGroupId) {
                    //Update list of pending groups
                    $scope.pendingGroups.splice(i, 1);
                    $scope.$apply();

                    displaySuccess("Group was successfully denied", 3000);

                    return;
                }
            }
        }).fail(function(jqXHR) {
            displayError(JSON.parse(jqXHR.responseText).message, 3000);
        });
    }

    /*----------------- UI Helper functions -----------------*/

    /**
     * Displays the error on the page. The message will disappear if the inputed
     * duration is a positive integer (in milliseconds)
     *
     * @param message - message to display in error box
     * @param duration - how long to display message, in milliseconds
     */
    var displayError = function(message, duration) {
        $scope.errorMsg = message;
        $scope.$apply();

        if (duration > 0) {
            setTimeout(function() {
                //Ensures that we are not overriding another message
                if ($scope.errorMsg === message) {
                    $scope.errorMsg = undefined;
                    $scope.$apply();
                }
            }, duration);
        }
    }

    /**
     * Displays the success message on the page. The message will disappear if the inputed
     * duration is a positive integer (in milliseconds)
     *
     * @param message - message to display in success box
     * @param duration - how long to display message, in milliseconds
     */
    var displaySuccess = function(message, duration) {
        $scope.successMsg = message;
        $scope.$apply();

        if (duration > 0) {
            setTimeout(function() {
                //Ensures that we are not overriding another message
                if ($scope.successMsg === message) {
                    $scope.successMsg = undefined;
                    $scope.$apply();
                }
            }, duration);
        }
    }

    /*----------------- Initialization -----------------*/
    $scope.getPendingGroups();
});