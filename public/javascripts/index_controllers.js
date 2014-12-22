// PRIMARY AUTHOR: Richard Lu

var loopApp = loopApp || angular.module('loopApp', ['ui.bootstrap']);

loopApp.controller('feedStartDateController', function($scope, $rootScope) {
    
    /*----------- Controller Functions --------------------*/
    
    /**
     *
     *  Set the start date to the currently selected date from the
     *  date picker, reload event feed.
     *
     **/
    $scope.setStartDate = function() {
        $rootScope.searchStartTime = $scope.startDate.getTime();
        $rootScope.loadEventFeed();
    };
    
    /**
     *
     *  Set the filters to the currently selected filters from the
     *  side widget, reload event feed.
     *
     **/
    $scope.applyFilters = function() {
        
        $rootScope.filterTags = [];
        for (var k in $scope.filterTags) {
            var tag = $scope.filterTags[k];
            if (tag.selected) {
                $rootScope.filterTags.push(tag.tag);
            }
        }
        
        $rootScope.filterGenlocs = [];
        for (var k in $scope.filterGenlocs) {
            var genloc = $scope.filterGenlocs[k];
            if (genloc.selected) {
                $rootScope.filterGenlocs.push(genloc.genloc);
            }
        }
        
        $rootScope.filterRsvp = $scope.filterRsvp;
        $rootScope.filterFollowing = $scope.filterFollowing;
        
        $rootScope.loadEventFeed();
    };
    
    /*----------- Initialization --------------------*/
    
    $scope.notUser = isAdmin || (userId === undefined);
    
    $scope.filterRsvp = false;
    $scope.filterFollowing = false;
    
    $scope.today = new Date();
    
    $scope.startDate = new Date(
        $scope.today.getFullYear(),
        $scope.today.getMonth(),
        $scope.today.getDate(),
        0,0,0,0
    );
    
    $scope.filterTags = [];
    for (var k in ALLOWED_TAGS) {
        $scope.filterTags.push({
            tag: ALLOWED_TAGS[k],
            selected: true
        });
    }
    
    $scope.filterGenlocs = [];
    for (var k in ALLOWED_GENERAL_LOCATIONS) {
        $scope.filterGenlocs.push({
            genloc: ALLOWED_GENERAL_LOCATIONS[k],
            selected: true
        });
    }
    
    $rootScope.searchStartTime = $scope.startDate.getTime();
    $rootScope.initLoadEvents = true;
    
});
