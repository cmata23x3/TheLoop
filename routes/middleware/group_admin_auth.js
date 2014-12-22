// PRIMARY AUTHOR: Richard Lu

var GroupController = require('../../controllers/group');
var Errors = require('../../errors/errors');

/**
 * Only allows group or site admin to perform the action
 */
module.exports = function(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    } else if (req.session) {
        
        // to be usable both in /api/groups/:groupId/events AND /api/groups
        var groupId = req.groupId || req.params.id;
        
        GroupController.getGroupById(groupId, function(err, group) {
            if (err) {
                err = Errors.groups.fetchAuth;
            }
            else if (!group) {
                err = Errors.groups.notFoundAuth;
            }
            else if (group.admins.indexOf(req.session.userId) < 0) {
                err = Errors.unauthorized;
            }
            
            if (err) {
                return res.status(err.status).send(err);
            }
            
            return next();
        });
    } else {
        var err = Errors.userAuth;
        return res.status(err.status).send(err);
    }
}