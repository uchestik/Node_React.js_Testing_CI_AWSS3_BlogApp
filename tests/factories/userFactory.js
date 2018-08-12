const mongoose = require('mongoose');
const User = mongoose.model('User');

//when we run jest it starts up a new node environment 
//executed from the command line
//it then looks for all the files that end with .test.js


module.exports = () => {
    return new User({}).save();
}