The Loop
=========
######*Calvin Li, Richard Lu, Christian Mata, Mikael Mengistu*
---
#####6.170 Final Team Project
The Loop is a web app that allows MIT students to search and view events happening on campus as well as providing student groups an alternate medium to publicize their events. 

The Loop was built on a MEAN (MongoDB, ExpressJS, AngularJS, NodeJS) stack and utilized Mocha testing. 

#####Directions: 
The Loop can be found at http://theloop-cmata.rhcloud.com. 
- Create a user account by clicking 'Log in' button and then clicking sign up
    - Note: An active MIT email is required to create groups
- You will receive an activation email to the address provided. Navigate to the link attached and verify your account
- Once verified, you can now RSVP for events, request a student group, and follow exisiting groups.
- Navigating to the 'Groups' page, you can create a group. 
    - Note: Groups must be approved by the site admin
- Once your group is approved, you are by default an admin and can now create events, edit the group's information, manage admins and delete your group. 

#####Testing
For testing, we implemented backend Mocha tests using ShouldJS and for the frontend, we wrote a script that makes API calls and checks the results to be as expected. 

To access the testing script, log in and navigate to http://theloop-cmata.rhcloud.com/tests in your browser. Here the API calls will be made with the current session.
- Note: Your session info is used and you're expected to be the admin of at least one group for the script to execute successfully. 

For the backend tests, when downloading the repository, navigate to the repo in your command line terminal and execute `mocha` to run the tests. 

#####Meeting Write-Up Links: 
- November 6: http://bit.ly/1AWGhGu
- November 13: http://bit.ly/1yBbYzx
- November 20: http://bit.ly/1xH3ytB
- December 4: http://bit.ly/1Aja6Ne
