// PRIMARY AUTHOR: Christian Mata

var loopApp = loopApp || angular.module('loopApp', []);

loopApp.controller('groupsCtrl', function($scope, $rootScope){
	//vars
	$scope.userId = userId;
	$scope.groups = [];   
	$scope.clusters = {};
	$scope.alpha = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T', 'U','V','W','X','Y','Z'];
	$scope.numbers = ['0','1','2','3','4','5','6','7','8','9'];
	$scope.col1 = [];
	$scope.col2 = [];
	$scope.col3 = [];
	$scope.registrationName = '';
	$scope.registrationDescription = '';
	$scope.adminGroups = [];
	$scope.followingGroups = [];

	/*
	* Method takes the exisiting groups & clusters them by
	* first character of their name. Returns an object.
	*
	* @param {Object} groups array of Group objects to be arranged
	* @returns {Object} object with keys as letters & arrays of Groups as values
	*/
	var alphabetizeGroups = function(groups){
		var result = {};
		//Sort the groups by alphabetatical order. 
		result = _.sortBy(groups, "name.toUpperCase()"); // could have issues
		//cluster the groups by first letter
		result = _.groupBy(result, function(group){
			return (group.name[0]).toUpperCase();//so all are grouped by same letter regardless of case 
		});
		return result;
	}

	/*
	* Method takes an object where each value is an array of Group objects
	* falling into a group by their first character of their names. 
	* Method then takes the group, populates with all letters of alphabet, 
	* and reassigns groups to new object. Also compresses all arrays beginnning 
	* with numbers into one group and all others fall into one grouping.
	*
	* @param {Object} groups - object where the key is the first letter 
	* @returns {Object} object where each letter is a key and each value is an object
	* with a header string and a groups array.
	*/
	var populateGroupsList = function(groups){
		var groupings = alphabetizeGroups(groups);
		var clusters = jQuery.extend(true, {}, groupings);
		var resultGroups = {};
		var numbersEntry = [];
		//compile the numbers into one groups
		$scope.numbers.forEach(function(number){
			if(_.has(clusters, number)){
				//number is in the clusters
				numbersEntry = numbersEntry.concat(clusters[number]);
			}
			delete clusters[number];
		});
		//add the numbers entry group into the result
		resultGroups['0-9'] = {
			header: '0-9',
			groups: numbersEntry
		};
		//add letters to resulting object
		$scope.alpha.forEach(function(letter){
			//add the letter into the clusters
			resultGroups[letter] = {
				header: letter
			};
			//check if the letter has a corresponding group
			if(_.has(clusters, letter)){
				//need to add this group in the results
				resultGroups[letter] = _.extend(resultGroups[letter], {groups: clusters[letter]});
			}
			delete clusters[letter];
		});
		//add all the remaining groups into last group
		var othersEntry = [];
		_.each(clusters, function(groups){
			othersEntry = othersEntry.concat(groups);
		});
		//'ZOthers will be at the end of the object'
		resultGroups['ZOthers'] = { 
			header: 'Others',
			groups: othersEntry
		};
		return resultGroups;
	}

	/*
	* Method splits the values of the populate group list object
	* into three even sized groups. Assigns scope variables of the columns
	*
	* @param {Object} groups - Object of groups clustered by first letter.
	*/
	var assignGroupColumns = function(clusters){
		var arrayOfClusters = _(clusters).values();
		var arrayLength = arrayOfClusters.length;
		$scope.col1 = arrayOfClusters.splice(0, Math.floor(arrayLength/3.0) );
		$scope.col2 = arrayOfClusters.splice(0, Math.floor(arrayLength/3.0));
		$scope.col3 = arrayOfClusters.splice(0);
	}

	/*
	* Method iterates over array of Group objecys to find instances of 
	* userId in their admin arrays. These Groups are then added to an array
	* and set to a scope variable.
	*
	* @param [Objects] groups - array of Group instances
	*/
	var findAdminGroups = function(groups){
		var adminGroups = [];
		//groups -> array of Group objects
		groups.forEach(function(group){
			if(group.admins.indexOf($scope.userId) >= 0){
				adminGroups.push(group);
			}
		});
		$scope.adminGroups = adminGroups;
	}

	/*
	* Method creates an array of groups that the current user is following.
	*
	* @param [Strings] followingGroups - array of Group Ids that the user is following
	* @param [Objects] allGroups - array of all Group objects 
	*/
	var findFollowingGroups = function(followingGroups, allGroups){
		var following = [];
		//iterate over each groupId
		followingGroups.forEach(function(groupId){
			//have groupId, need to find group its corresponds to & add to array
			following.push(_.findWhere(allGroups, {_id: groupId}));
		});
		//assign the scope var
		$scope.followingGroups = following;
		$scope.$apply(); //Apply the update
	}

	/*
	* Method makes AJAX call to db for the Group object. 
	* If successful, scope variables are assigned. 
	* 
	* @param String groupId - MongoDB Id of the group
	* @param Function callback - method that is excuted upon
	* 							 successful ajax call
	*/
	var getUserInformation = function(userId, callback){
		if(userId){
			//create the url path
			var url = '/api/users/' + userId;
			$.ajax({
				url: url,
				method: 'GET',
				data: {},
				success : function(user) {
					callback(user);
				},
				error : function(err) {
					$rootScope.displayJqxhrErrorOnFeed(err, 3000);
				}
			});
		}
	}

	/*
	* Method makes ajax call to get the groups and then applies the 
	* updated groups into the view.
	*/
	var reRenderPage = function(){
		$.ajax({
			url: '/api/groups',
			method: 'GET',
			data: {},
			success : function(groups) {
				$scope.groups = groups;
				$scope.clusters = populateGroupsList(groups);
				assignGroupColumns($scope.clusters);
				findAdminGroups(groups);
				getUserInformation( $scope.userId, function(user){
					findFollowingGroups(user.following, groups);
				});
				$scope.$apply(); //Apply the update
			},
			error : function(err) {
				$rootScope.displayErrorOnFeed(err, 3000);
			}
		});
	}

	/*
	* Method makes ajax call to submit a pending group. Takes scope 
	* variables as the inputs and creates the request. 
	* If successful, reRender the page.
	* IF error, display error.
	*
	*/
	$scope.submitGroupRegistration = function(){
		//take the values & submit to backend
		var admins = [$scope.userId];
		$.ajax({
			url: '/api/pending_groups',
			method: 'POST',
			data: {
				name: $scope.registrationName,
				description: $scope.registrationDescription,
				creator: $scope.userId
			},
			success : function(data) {
				reRenderPage();
			},
			error : function(err) {
				$rootScope.displayErrorOnFeed(err, 3000);
			}
		});
		//clear the inputs
		$scope.registrationName = '';
		$scope.registrationDescription = '';    
	}

	/*
	* Make the inital call to the database to populate the page
	*/
	reRenderPage();
});

loopApp.controller('groupCtrl', function($scope, $location, $rootScope){
	$scope.userId = userId;
	$scope.isAdmin = false;
	$scope.description = '';
	$scope.name = '';
	$scope.group = {};
	$scope.groupId = function(){
		return _.last($location.absUrl().split('/'));
	}(); 
	//scope vars for editing the description
	$scope.editingDescription = '';
	$scope.editing = false;
	//scope vars for editing admins
	$scope.managingAdmins = false;
	$scope.newAdminEmail = '';
	//scope vars for following/unfollowing
	$scope.followingStatus = false;
	$scope.followingLabel = 'follow';

	/*
	* Method makes AJAX call to db for the Group object. 
	* If successful, scope variables are assigned. 
	* 
	* @param String groupId - MongoDB Id of the group
	*/
	var getGroupInformation = function(groupId){
		var url = '/api/groups/' + groupId;
		$.ajax({
			url: url,
			method: 'GET',
			data: {
				populate: true
			},
			success : function(group) {
				handleGroupInformation(group);
			},
			error : function(err) {
				$rootScope.displayErrorOnFeed(err, 3000);
			}
		});
	}

	/*
	* Method sets the scope variables to reflect a given Group instance.
	* Similar to an initialization method that sets variables 
	* 
	* @param {Object} group - new Group instance of the current view 
	*/    
	var handleGroupInformation = function(group){
		$scope.name = group.name;
		$scope.description = group.description;
		$scope.group = group;
		$scope.isAdmin = setAdminInformation($scope.userId, group.admins);
		var now = new Date();
		// start from the beginning of today
		$rootScope.searchStartTime = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			0,0,0,0
		).getTime();
		$rootScope.filterGroupId = group._id;
		$rootScope.loadEventFeed();
		$scope.$apply(); //Apply the update
	}

	/*
	* Method checks for the admin id in array of group admins
	* 
	* @param String userId - MongoDB Id of the current user
	* @param [String] admins - Array of userIds that are admins for the current group
	* @returns Boolean - returns the result of the finding the admin id in the array
	*/
	var setAdminInformation = function(userId, admins){
		//check if the current user is in the array
		var admins = _.pluck(admins, '_id');
		if(admins.indexOf(userId) >= 0){
			return true;
		}
		return false;
	}

	/*
	* Method makes AJAX call to db for the Group object. 
	* If successful, scope variables are assigned. 
	* 
	* @param String groupId - MongoDB Id of the group
	* @param Function callback - method that is excuted upon
	* 							 successful ajax call
	*/
	var getUserInformation = function(userId, callback){
		if(userId){
			//create the url path
			var url = '/api/users/' + userId;
			$.ajax({
				url: url,
				method: 'GET',
				data: {},
				success : function(user) {
					callback(user);
				},
				error : function(err) {
					$rootScope.displayJqxhrErrorOnFeed(err, 3000);
				}
			});
		}
	}

	/*
	* Method sets values from the User object into scope variables
	* 
	* @param {Object} user - the User object of the person in session 
	* @param String groupId - Object Id of the current group being displayed
	* @param Boolean populated - Indicator for if the Following array in 
	*							 user is populated
	*/
	var setFollowingInformation = function(user, groupId, populated){
		var following = user.following;
		if(populated){
			following = _.pluck(following, '_id');
		}
		$scope.followingStatus = (following.indexOf(groupId) >= 0);
		$scope.followingLabel = ($scope.followingStatus ? 'unfollow' : 'follow');
		$scope.$apply(); //Apply the update
	}	

	/*
	* Method toggles between editing mode and view mode. Uses scope 
	* variables to determine which logic to use. 
	*/
	$scope.toggleDescriptionEdit = function(){
		if($scope.editing){ //was editing, now exiting
			//reset the editingDescript variable
			$scope.editingDescription = '';
			//set the editing var to false
			$scope.editing = false;
		} else { //entering editing mode
			//set the scope var; to have its own reference 
			$scope.editingDescription = $scope.description;
			//toggle the show variable
			$scope.editing = true;
		}
	}

	/*
	* Method takes the edited description and puts the change via ajax. 
	*/
	$scope.submitDescriptionEdit = function(){
		//create the url path
		var url = '/api/groups/' + $scope.groupId + '/description';
		//make the ajax call
		$.ajax({
			url: url,
			method: 'PUT',
			data: {
				description: $scope.editingDescription
			},
			success : function(group) {
				//exit editing mode
				$scope.toggleDescriptionEdit();
				//update the page with the new info
				handleGroupInformation(group);
			},
			error : function(err) {
				$rootScope.displayJqxhrErrorOnFeed(err, 3000);
			}
		});
	}

	/*
	* Method toggles between managing mode and view mode. Uses scope 
	* variables to determine which logic to use. 
	*/
	$scope.toggleManageAdmins = function(){
		if($scope.managingAdmins){//was managing, now exiting
			$scope.managingAdmins = false;
		} else{//entering managing
			$scope.managingAdmins = true;
			//set the variable again
			$scope.newAdminEmail = '';
		}
	}

	/*
	* Method adds admin to the admins array of a group. 
	*/
	$scope.addAdmin = function(){
		//create the url path
		var url = '/api/groups/' + $scope.groupId + '/admin';
		//make the ajax call
		$.ajax({
			url: url,
			method: 'PUT',
			data: {
				email: $scope.newAdminEmail
			},
			success : function(group) {
				//exit editing mode
				$scope.toggleManageAdmins();
				//update the page with the new info
				handleGroupInformation(group);
			},
			error : function(err) {
				$rootScope.displayErrorOnGroupLeft(err, 3000);
			}
		});
	}

	/*
	* Method removes the admins specified.  
	*/
	$scope.removeAdmin = function(id){
		if($scope.group.admins.length === 1){
			//dont send request. 
			$rootScope.displayErrorOnGroupLeft('Cannot remove only admin', 3000);
		}
		else{
			//create the url path
			var url = '/api/groups/' + $scope.groupId + '/admin';
			//make the ajax call
			$.ajax({
				url: url,
				method: 'DELETE',
				data: {
					personId: id
				},
				success : function(group) {
					//exit editing mode
					$scope.toggleManageAdmins();
					//update the page with the new info
					handleGroupInformation(group);
				},
				error : function(err) {
					$rootScope.displayErrorOnGroupLeft(err, 3000);
				}
			});
		}
	}

	/*
	* Method deletes the group. Takes the current groupId and makes
	* ajax call to delete the group & all events made by the group. 
	*/
	$scope.deleteGroup = function(){
		//create the url path
		var url = '/api/groups/' + $scope.groupId;
		//send the ajax call
		$.ajax({
			url: url,
			method: 'DELETE',
			data: {},
			success : function(group) {
		    	//update path & redirect
		    	$location.path('/');
		    	window.location.href = $location.url();
		    },
		    error : function(err) {
		    	$rootScope.displayJqxhrErrorOnFeed(err, 3000);
		    }
		});
	}

	/*
	* Method toggles from follow to unfollow and vice versa. 
	* Makes ajax call depending on whether the session user is 
	* already following or wants to follow. Update the views upon
	* successful ajax change.  
	*/
	$scope.toggleFollowing = function(){
		//create the url path
		var url = '/api/users/' + $scope.userId + '/following/' + $scope.groupId;
		//determine the method to be done, 
		//if true(already following), DELETE; else, POST
		var method = ($scope.followingStatus ? 'DELETE' : 'POST');
		//make the ajax call
		$.ajax({
			url: url,
			method: method,
			data: {},
			success : function(user) {
				setFollowingInformation(user, $scope.groupId, true);
			},
			error : function(err) {
				$rootScope.displayJqxhrErrorOnFeed(err, 3000);
			}
		});
	}

	/*
	* Function available in scope. Stolen from Mikael's implementation
	* Simple string input checking. 
	*
	* @param String email - Email String that is to be checked
	* @returns Boolean - Returns true is the string is an MIT email, false otherwise
	*/
	$scope.isMITEmail = function(email) {
		if(email.length > 8){
			var index = email.indexOf("@");
			var emailSuffix = email.substring(index+1, email.length);
			if(emailSuffix === "mit.edu"){
				return true;
			}
		}
		return false;
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
     $rootScope.displayErrorOnGroupLeft = function(error, duration) {
     	var message = '';
     	if(typeof error === 'string'){
     		message = error;
     	}
     	else{
     		message = JSON.parse(error.responseText).message;
     	}
     	if (typeof duration === 'number') {
     		var alert = $(
     			'<div class="alert alert-danger" role="alert">'
     			+message
     			+'</div>'
     			);
     		$('.group-left-pane').prepend(alert);
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
     		$('.group-left-pane').prepend(
     			'<div class="alert alert-danger alert-dismissible" role="alert">'
     			+'<button type="button" class="close" data-dismiss="alert">'
     			+'<span aria-hidden="true">&times;</span><span class="sr-only">Close</span>'
     			+'</button>'
     			+message
     			+'</div>'
     			);
     	}
     };

	getGroupInformation($scope.groupId);
	getUserInformation($scope.userId, function(user){
		setFollowingInformation(user, $scope.groupId);
	});
});
