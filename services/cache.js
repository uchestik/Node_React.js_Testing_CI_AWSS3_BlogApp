const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys')

// const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

//get reference to the default exec function

const exec = mongoose.Query.prototype.exec;

//lets enable cache toggling
//this refers to the query instance
mongoose.Query.prototype.cache = function(options = {}){
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this; //this makes it chainable
}

mongoose.Query.prototype.exec = async function(){
    if(!this.useCache){
        return exec.apply(this, arguments);
    }
    //get unique key by merging query object to collection name
    const key = JSON.stringify(Object.assign({}, this.getQuery(),{
        collection : this.mongooseCollection.name
    }));
    
    //see if we have key in redis
    const cacheValue = await client.hget(this.hashKey, key);
    if(cacheValue){
        //exec wants us to return a mongoose document
        // this references Query.prototype
        //we need to account for 2 cases. When we are to return 
        //an array of objects or a single object
        
        const doc = JSON.parse(cacheValue);

        return Array.isArray(doc) ? 
            doc.map(d => new this.model(d))
            :
            new this.model(doc);
    }
    
    const result = await exec.apply(this, arguments);
    
    client.hset(this.hashKey, key, JSON.stringify(result));
    
    return result;
}

//deleting cache
module.exports = {
    clearHash(hashKey){
        client.del(JOSN.stringify(hashKey))
    }
}