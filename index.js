'use strict';

var Promise = require('bluebird');
var env = require('env-var');
var MongoClient = require('mongodb').MongoClient;

var mongoUrl = env('FH_MONGODB_CONN_URL', 'mongodb://localhost:27017/FH_LOCAL').asString();

var dbPromise = Promise.resolve(MongoClient.connect(mongoUrl));

// Returns a BLUEBIRD promise for the collection.
// Note that by starting any chain with this promise, that will assure that
//  all other promises in the chain will also be BLUEBIRD promises
exports.collection = function(collectionName) {
    // TODO: What to do if the dbPromise fails the first time?
    // Need to catch an error, wait for a bit, then retry...
    return dbPromise
        .then(function(db) {
            return db.collection(collectionName);
        });
};
