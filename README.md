# rhmap-mongodb
Mongodb Promise wrapper for RHMAP

### Purpose
Connects to Mongodb on the RHMAP platform, and wraps the connection in a 
[Bluebird](https://www.npmjs.com/package/bluebird) promise for ease of use.

### Usage
```js
var mongo = require('rhmap-mongodb');

mongo.collection('MY_COLLECTION')
    .then(function(collection) {
        return collection.insert(myData);
    });
```

### TODO
1. Currently, if the database is down on startup, then all calls to mongo will reject.
(This is very rarely an issue -- if mongodb is down on the platform, chances are that 
you're already in bad shape. Restart the app once mongodb is up and you should be fine.)