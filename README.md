# rhmap-mongodb
Mongodb Promise wrapper for RHMAP

## Purpose
- Connects to Mongodb on the RHMAP platform, retrying indefinitely if necessary, in the case of the DB being down.
- Exposes a collection function that provides all Mongodb colleciton functions,
except wrapped in [Bluebird](https://www.npmjs.com/package/bluebird) promise for ease of use.
- Also exposes the raw connected MongoClient, if necessary.

## Usage
First of all, you need to make sure your database on RHMAP has been "upgrades". Go to the databrowser, and click "Update Database". This will restart your application, and allow your application to connect directly to the database instead of through `$fh.db`.

```js
var mongo = require('rhmap-mongodb');

var collection = mongo.collection('MY_COLLECTION');

exports.createRecord = function(record) {
    return collection.insert(record);
};
```

## API
`collection(collectionName)` - Returns an object containing all collection functions that
the mongodb module provides. IE: `find()`, `insert()`, `remove()`, etc. 
These functions all return Bluebird promises. 
```js
mongo.collection('FOO')
    .find({status: 'failed'}) // Call the find() mongodb collection function
    .call('toArray') // Returns a bluebird promise, so we can use its utility functions.
    .map(function(failedRecord) {
        return sendEmailNotification(failedRecord);
    });
```

`db()` - Returns a **promise** that resolves to the connected Mongodb driver. 
This returns the equivalent of calling `MongoClient.connect(url)`.

## Configuration
Configuration is done via environment variables:

`FH_MONGODB_CONN_URL` - This is the URL for connecting to Mongo. This is set automatically by the RHMAP platform. Defaults to `mongodb://localhost:27017/FH_LOCAL`

`RHMAP_MONGO_CONNECT_RETRY_INTERVAL` - This is the number of milliseconds between retries if the Mongo database is not immediately available. Defaults to `10000` (10 seconds)

## Contributing

### Testing
Just run `npm test`. You must have a version of Mongodb running locally. 
The preferred version is 2.4.6, as that is what RHMAP currently runs.
