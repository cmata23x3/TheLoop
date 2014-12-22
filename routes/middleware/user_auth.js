// PRIMARY AUTHOR: Calvin Li

var Errors = require('../../errors/errors');

/**
 * Only allows logged-in users and site admins to perform the action
 */
module.exports = function(req, res, next) {
    if (req.session && req.session.name) {
        next();
    } else {
        var err = Errors.userAuth;
        res.status(err.status).send(err);
        res.end();
    }
}