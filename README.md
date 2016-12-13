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
