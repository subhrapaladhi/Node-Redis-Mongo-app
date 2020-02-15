// ---------------------------     DONT FORGET TO START THE REDIS SERVER USING "redis-server"  -------------------------
const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);                // client get does not support promises. this is a way to promisify them

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function(){
    this.useCache = true;
    return this;
}

mongoose.Query.prototype.exec = async function(){

    if(!this.useCache){
        return exec.apply(this, arguments)
    }

    // this represents mongoose.Query.prototype.exec
    // we are not taking this.getQuery() as first object as we don't want it to be changed
    //redis only accepts numbers and strings
    let key = JSON.stringify(Object.assign({},this.getQuery(),{collection: this.mongooseCollection.name}));

    //see if we have a value for key in redis
    const cacheValue = await client.get(key)

    // if value for key exists then->
    if(cacheValue){
        // While storing data in redis we may store a single object or an array of objects.
        // We need to convert the normal json into model instance
        console.log(cacheValue)
        const doc = JSON.parse(cacheValue)

        return  Array.isArray(doc)
                ? doc.map((d)=>new this.model(d))
                : new this.model(doc);
    }

    // otherwise, get the data from Mongodb and save the data to redis also
    const result = await exec.apply(this, arguments)

    /* Mongoose does not return plain json. It returns "model instance" which also have various functions
    *  So we can't store result directly into redis. We need to convert it into pure json then stringify it 
    *  then we can save it in reids
    */

    client.set(key, JSON.stringify(result));

    return result
}