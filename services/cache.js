// ---------------------------     DONT FORGET TO START THE REDIS SERVER USING "redis-server"  -------------------------
const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);                // client get does not support promises. this is a way to promisify them

mongoose.Query.prototype.cache = function(hkey){
    this.useCache = true;

    // this is the top level key like motercycles or cars or trucks etc
    this.hashkey = JSON.stringify(hkey || '')

    return this;
}

// We are storing the default exec() function in the exec variable
const exec = mongoose.Query.prototype.exec 

mongoose.Query.prototype.exec = async function(){ // Modifing the exec property of mongoose
    // this = mongoose.Query.prototype.exec
    // When useCache = false we should directly send the query to MongoDB and return the result to app.js
    if(!this.useCache){
        return exec.apply(this, arguments)
    }

    /* Here is how our key looks
     * key = '{query_param_1: param_1_value, query_param_2: param_2_value,...... , collectoin: collection name}'
     * we need to stringigy the object before storing in redis cache
    */
    let key = JSON.stringify(Object.assign({},this.getQuery(),{collection: this.mongooseCollection.name}));

    /* Querying the cache
     * if value for key exists then, cacheValue = data
     * else, cacheValue = null
    */
    const cacheValue = await client.hget(this.hashkey, key)
    
    // When data is found in redis cache
    if(cacheValue){
        const doc = JSON.parse(cacheValue)  // converting back to original datatype from string

        /* While storing data in redis we may store a single object or an array of objects. 
         * We need to convert normal json into mongoose model instance before returning to app.js, 
         * this.model() is used for this purpose
        */
        return  Array.isArray(doc)
                ? doc.map((d)=>new this.model(d))
                : new this.model(doc);
    }

    // Data not present in redis cache, get the data from Mongodb and save the data to redis cache also
    const result = await exec.apply(this, arguments) // using the default exec function

    // just some logic to check if the data for the required query is even present in the database
    if(result){ // mongodb retured non-null value (can be empty array)
        if(Array.isArray(result) && result.length==0){
            // array is empty
            return null
        }
        else{
            // data is there (non-empty array or an single object)
            client.hset(this.hashkey, key, JSON.stringify(result)); // saving data in redis cache
            return result
        }
    }else{ // database returned null value
        console.log("data not present")
        return null
    } 
}

module.exports = 
    function clearCache(hashkey){
        client.del(JSON.stringify(hashkey))
    }