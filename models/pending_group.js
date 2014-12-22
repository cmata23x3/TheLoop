// PRIMARY AUTHOR: Calvin Li

var mongoose = require('mongoose');

/*
* Defining the Pending Group Schema and model. 
*/
var PendingGroupSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},  
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

var PendingGroup = mongoose.model('PendingGroup', PendingGroupSchema);

module.exports = PendingGroup;