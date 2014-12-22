// All authored

//Model-based errors should be placed into these objects
var users = module.exports.users = {};
var events = module.exports.events = {};
var groups = module.exports.groups = {};
var images = module.exports.images = {};
var pendingGroups = module.exports.pendingGroups = {};

module.exports.unauthorized = {
    status: 401,
    name: 'Unauthorized',
    message: 'You are not authorized to perform this action'
}

module.exports.userAuth = {
    status: 401,
    name: "UserAuthError",
    message: "You must be logged in to perform this action"
}

module.exports.groupAdminAuth = {
    status: 401, 
    name: 'GroupAdminError',
    message: 'Only Group Admin can perform this action'
}

module.exports.siteAdminNotAllowed = {
    status: 401,
    name: "SiteAdminNotAllowedError",
    message: "Site Admin cannot perform this action"
}

module.exports.siteAdminAuth = {
    status: 401,
    name: "SiteAdminAuthError",
    message: "Only Site Admin can perform this action"
}

// --------------- User-based Errors --------------- //

users.alreadyExists = {
    status: 400,
    name: 'EmailConflict',
    mesage: 'An account associated with this email already exists!'
};

users.notFound = {
    status: 404,
    name: 'NotFound',
    message: 'The user could not be found'
};

users.fetch = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem fetching the user'
};

users.save = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem saving the user'
};

//Additional Following Errors
users.following = {
    status: 500,
    name: 'DatabaseError',
    mesage: 'There was a problem updating the groups your following'
};

users.delete = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem removing the user'
};

// --------------- Event-based Errors --------------- //

events.notFound = {
    status: 404,
    name: 'NotFound',
    message: 'The event could not be found'
};

events.create = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem creating your event'
};

events.fetch = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem fetching events'
};

events.save = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem saving your event'
};

events.update = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem updating your event'
};

// --------------- Group-based Errors --------------- //

groups.create = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem creating your group'
};

groups.fetch = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem fetching groups'
};

groups.fetchAuth = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem fetching the authorizing group'
};

groups.update = {
    status: 500, 
    name: 'DatabaseError',
    message: 'There was a problem updating your group'
}

groups.delete = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem removing your group'
};

groups.notFound = {
    status: 404,
    name: 'NotFound',
    message: 'The group could not be found'
};

groups.notFoundAuth = {
    status: 404,
    name: 'NotFound',
    message: 'The authorizing group could not be found'
};

groups.update = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem updating your group'
};

// --------------- Image-based Errors --------------- //

images.invalidType = {
    status: 400,
    name: 'InvalidTypeError',
    message: 'Image must be a png or jpeg'
};

images.buildDirectory = {
    status: 500,
    name: 'BuildDirectoryError',
    message: 'Could not build directory to upload file'
};

// --------------- PendingGroup-based Errors --------------- //

pendingGroups.create = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem creating the pending group'
};

pendingGroups.fetch = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem fetching pending groups'
};

pendingGroups.delete = {
    status: 500,
    name: 'DatabaseError',
    message: 'There was a problem removing the pending group'
};

pendingGroups.notFound = {
    status: 404,
    name: 'NotFound',
    message: 'The pending group could not be found'
};
