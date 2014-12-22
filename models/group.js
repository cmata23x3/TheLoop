// PRIMARY AUTHOR: Christian Mata

var mongoose = require('mongoose');

/*
* Defining the Group Schema and model. 
*/
var GroupSchema = new mongoose.Schema({
	name: {type: String, required:true},
	description: {type: String, required:true},
	imageURL: String,  
	admins: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

var Group = mongoose.model('Group', GroupSchema);

module.exports = Group;