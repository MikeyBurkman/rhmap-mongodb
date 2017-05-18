# rhmap-mongodb
Mongodb Promise wrapper for RHMAP

## Purpose
- Connects to Mongodb on the RHMAP platform, retrying indefinitely if necessary, in the case of the DB being down.
- Exposes a collection function that provides all Mongodb colleciton functions,
except wrapped in [Bluebird](https://www.npmjs.com/package/bluebird) promise for ease of use.
- Also exposes the raw connected MongoClient, if necessary.
- Node 0.10 compliant (for now)

## Usage
First of all, you need to make sure your database on RHMAP has been "upgraded". Go to the Data Browser, and click "Upgrade Database". This will restart your application, and allow your application to connect directly to the database instead of through `$fh.db`.

```js
var mongo = require('rhmap-mongodb');

var collection = mongo.collection('MY_COLLECTION');

exports.createRecord = function createRecord(record) {
    return collection.insert(record);
};
```

## API
`collection(collectionName)` - Returns an object containing all collection functions that
the mongodb module provides. IE: `find()`, `insert()`, `remove()`, etc.
**These functions all return strict Bluebird promises**, even if the original mongodb functions did not. (See below caveats for more details.)
```js
mongo.collection('FOO')
    .find({status: 'successs'}) // Call the find() mongodb collection function
    .then((cursor) => cursor.toArray())
    .map((successRecord) => log.debug('Processed record: ', successRecord)); // Returns a bluebird promise, so we can use its utility functions.
```

`db()` - Returns a **promise** that resolves to the connected Mongodb driver.
This returns the equivalent of calling `MongoClient.connect(url)`.

`mongodb` - This is a property that exposes the underlying `mongodb` module this module uses internally.

## Configuration
Configuration is done via environment variables:

`FH_MONGODB_CONN_URL` - This is the URL for connecting to Mongo. This is set automatically by the RHMAP platform. Defaults to `mongodb://localhost:27017/FH_LOCAL`

`RHMAP_MONGO_CONNECT_RETRY_INTERVAL` - This is the number of milliseconds between retries if the Mongo database is not immediately available. Defaults to `10000` (10 seconds)

## Caveats
One thing to note is that functions like `find()` in the standard mongodb driver return a cursor object, whereas in rhmap-mongodb, `find()` will return a (Bluebird) promise that *resolves* to a cursor.
```js
// Legal in the standard mongodb driver, but will NOT work with rhmap-mongo
standardmongo.collection('foo')
    .find()
    .sort({date: 1})
    .toArray()
    .then((resultsArray) => ...);

// Instead you must call functions on the resolved cursor
rhampmongo.collection('foo')
    .find()
    .then((cursor) => cursor.sort({date: 1}).toArray())
    .then((resultsArray) => ...);
```

## Contributing

### Testing
Just run `npm test`. You must have a version of Mongodb running locally.
The preferred version is 2.4.6, as that is what RHMAP currently runs.
