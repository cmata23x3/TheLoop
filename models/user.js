// PRIMARY AUTHOR: Mikael Mengistu

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;



var UserSchema = mongoose.Schema({

  email: String,
  password: String,
  firstName: String,
  lastName: String,
  following: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}],
  activated:Boolean
  

});

var User = mongoose.model('User', UserSchema);
module.exports = User;