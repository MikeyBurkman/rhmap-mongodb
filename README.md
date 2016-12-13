# rhmap-mongodb
Mongodb Promise wrapper for RHMAP

### Purpose
Connects to Mongodb on the RHMAP platform, and wraps the connection in a 
[Bluebird](https://www.npmjs.com/package/bluebird) promise for ease of use.

### Usage
First of all, you need to make sure your database on RHMAP has been "upgrades". Go to the databrowser, and click "Update Database". This will restart your application, and allow your application to connect directly to the database instead of through `$fh.db`.

Next, in your code, simply require `rhmap-mongodb` and then call `collection(collectionName)` on it. This will return a Bluebird Promise that resolves to the Mongo db.collection object. This has functions such as [find](https://docs.mongodb.com/v2.4/reference/method/db.collection.find/), [insert](https://docs.mongodb.com/v2.4/reference/method/db.collection.insert/), etc.

```js
var mongo = require('rhmap-mongodb');

mongo.collection('MY_COLLECTION')
    .then(function(collection) {
        return collection.insert(myData);
    });
    
// Also, you can take advantage of Bluebird functions!
mongo.collection('MY_COLLECTION').call('insert', myData);
```

### Configuration
Configuration is done via environment variables:

`FH_MONGODB_CONN_URL` - This is the URL for connecting to Mongo. This is set automatically by the RHMAP platform. Defaults to `mongodb://localhost:27017/FH_LOCAL`

`RHMAP_MONGO_CONNECT_RETRY_INTERVAL` - This is the number of milliseconds between retries if the Mongo database is not immediately available. Defaults to `10000` (10 seconds)
