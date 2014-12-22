// PRIMARY AUTHOR: Calvin Li

var Errors = require('../../errors/errors');

/**
 * Only allows logged-in site admins to perform the action
 */
module.exports = function(req, res, next) {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        var err = Errors.siteAdminAuth;
        res.status(err.status).send(err);
        res.end();
    }
}