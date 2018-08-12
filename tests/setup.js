jest.setTimeout(30000); //this tells jest to wait 30seconds before failing any test

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

//telling mongoose to use the Node.js global promise object
mongoose.Promise = global.Promise;
//useMongoClient prevents a deprication warning
mongoose.connect(keys.mongoURI, {useMongoClient : true})

//we need ot force jest to read this file as it is not a 
//.test.js file. package.json - jest object