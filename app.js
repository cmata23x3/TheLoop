var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var busboy = require('connect-busboy');

var routes = require('./routes/index');
var usersApi = require('./routes/api/users');
var eventsGlobalApi = require('./routes/api/events_global');
var eventsGroupApi = require('./routes/api/events_group');
var groupsApi = require('./routes/api/groups');
var pendingGroupsApi = require('./routes/api/pending_groups');

var app = express();

var dbURL = 'mongodb://localhost/TheLoop';
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    dbURL = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/theloop';
}
var mongoose = require('mongoose').connect(dbURL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongoose connection error'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(busboy());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'a4f8071f-c873-4447-8ee2',
      
}));

app.use('/', routes);
app.use('/api/users', usersApi);
app.use('/api/groups', groupsApi);
app.use('/api/events', eventsGlobalApi);
app.use('/api/groups/:groupId/events', function(req, res, next) {
    // forward groupId param to router
    req.groupId = req.params.groupId;
    next();
}, eventsGroupApi);
app.use('/api/pending_groups', pendingGroupsApi);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

console.log('Running on: ', (process.env.OPENSHIFT_NODEJS_PORT || 8080));
app.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080,
    process.env.OPENSHIFT_NODEJS_IP);

module.exports = app;
