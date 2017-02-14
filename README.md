# rhmap-mongodb
Mongodb Promise wrapper for RHMAP

## Purpose
- Connects to Mongodb on the RHMAP platform, retrying indefinitely if necessary, in the case of the DB being down.
- Exposes a collection function that provides all Mongodb colleciton functions,
except wrapped in [Bluebird](https://www.npmjs.com/package/bluebird) promise for ease of use.
- Also exposes the raw connected MongoClient, if necessary.

## Usage
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


## Contributing

### Testing
Just run `npm test`. You must have a version of Mongodb running locally. 
The preferred version is 2.4.6, as that is what RHMAP currently runs.