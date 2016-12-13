'use strict';

var Promise = require('bluebird');
var env = require('env-var');
var MongoClient = require('mongodb').MongoClient;

var mongoUrl = env('FH_MONGODB_CONN_URL', 'mongodb://localhost:27017/FH_LOCAL').asString();
var retryInterval = env('RHMAP_MONGO_CONNECT_RETRY_INTERVAL', 10000).asPositiveInt();

exports.db = new Promise(function(resolve) {
    attemptConnection(resolve);
});

// Returns a BLUEBIRD promise for the collection.
// Note that by starting any chain with this promise, that will assure that
//  all other promises in the chain will also be BLUEBIRD promises
exports.collection = function(collectionName) {
    return exports.db.call('collection', collectionName);
};


// Will call onConnect(database) only after successfully connecting to the database
function attemptConnection(onConnect) {
    Promise.resolve(MongoClient.connect(mongoUrl))
        .then(onConnect)
        .catch(function(err) {
            console.log('Error connecting to mongo, trying again later', err.stack || err);
            Promise.delay(retryInterval).then(function() {
                attemptConnection(onConnect);   
            });
        });
}