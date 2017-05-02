'use strict';

var Promise = require('bluebird');
var env = require('env-var');
var fhapi = require('fh-mbaas-api');
var MongoClient = require('mongodb').MongoClient;
var Collection = require('mongodb').Collection;

var retryInterval = env('RHMAP_MONGO_CONNECT_RETRY_INTERVAL', 10000).asPositiveInt();

var collectionFns = Object.keys(Collection.prototype);

exports.db = new Promise(function(resolve) {
    attemptConnection(resolve);
});

// Returns an object that can be used just like a Mongo Collection object.
// The results of each collection function will be a BLUEBIRD promise.
// IE: require('rhmap-mongodb').collection('FOO_COLLECTION').find({...}).map(...);
exports.collection = function(collectionName) {

    var collPromise = exports.db.call('collection', collectionName);

    var res = {};
    collectionFns.forEach(function(fnName) {
        res[fnName] = function() {
            var args = arguments;
            return collPromise.then(function(collection) {
                return collection[fnName].apply(collection, args);
            });
        };
    });

    return res;
};


// Will call onConnect(database) only after successfully connecting to the database
function attemptConnection(onConnect) {
    getConnectionString()
        .then(function(mongoUrl) {
            return MongoClient.connect(mongoUrl);
        })
        .then(onConnect)
        .catch(function(err) {
            console.log('Error connecting to mongo, trying again later', err.stack || err);
            Promise.delay(retryInterval).then(function() {
                attemptConnection(onConnect);   
            });
        });
}

function getConnectionString() {
    return Promise.fromCallback(function(cb) {
        return fhapi.db({
            act: 'connectionString'
        }, cb);
    })
    .then(function(str) {
        return str || 'mongodb://localhost:27017/FH_LOCAL';
    });
}