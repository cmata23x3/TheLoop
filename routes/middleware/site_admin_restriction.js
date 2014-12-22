// PRIMARY AUTHOR: Calvin Li

var Errors = require('../../errors/errors');

/**
 * Does not allow site admin to perform the action.
 */
module.exports = function(req, res, next) {
    if (req.session && req.session.isAdmin) {
        var err = Errors.siteAdminNotAllowed;
        res.status(err.status).send(err);
        res.end();
    } else {
        next();
    }
}