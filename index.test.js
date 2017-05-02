'use strict';

var Promise = require('bluebird');
var env = require('env-var');
var proxyquire = require('proxyquire').noPreserveCache();
var sinon = require('sinon');
var expect = require('chai').expect;

describe(__filename, function() {

    describe('#Connecting', function() {

        var connectStub;
        var dbStub;
        var mockEnv;

        beforeEach(function() {
            connectStub = sinon.stub();
            dbStub = sinon.stub();
            mockEnv = {};
        });

        function getModule() {
            return proxyquire('./index', {
                mongodb: {
                    MongoClient: {
                        connect: connectStub
                    }
                },
                'env-var': env.mock(mockEnv),
                'fh-mbaas-api': {
                    db: dbStub
                }
            });
        }

        it('Should connect successfully', function() {
            dbStub.yields(null, 'abc');

            var collectionStub = sinon.stub().returns({
                find: sinon.stub().returns(Promise.resolve('foo'))
            });
            connectStub.returns(Promise.resolve({
                collection: collectionStub
            }));

            var coll = getModule().collection('foo');
            
            return coll.find().then(function(result) {
                expect(result).to.eql('foo');
                expect(connectStub.callCount).to.eql(1);
                expect(connectStub.getCall(0).args[0]).to.eql('abc');
            });
        });

        it('Should continue trying to connect', function() {
            dbStub.yields(null, 'abc');

            mockEnv = {
                RHMAP_MONGO_CONNECT_RETRY_INTERVAL: 200
            };

            connectStub.onCall(0).returns(Promise.reject(new Error('first error')));
            connectStub.onCall(1).returns(Promise.reject(new Error('second error')));

            var collectionStub = sinon.stub().returns({
                find: sinon.stub().returns(Promise.resolve('bar'))
            });
            connectStub.onCall(2).returns(Promise.resolve({
                collection: collectionStub
            }));

            var coll = getModule().collection('foo');

            return coll.find().then(function(result) {
                expect(result).to.eql('bar');
                expect(connectStub.callCount).to.eql(3);
            });
        });
    });

    describe('#collection', function() {
        var collName = 'FOO_COLLECTION';
        var mod;

        beforeEach(function() {
            mod = proxyquire('./index', {
                'fh-mbaas-api': {
                    db: sinon.stub().yields() // Use local DB
                }
            });

            return mod.collection(collName).remove(); // Clean the db
        });

        it('Should return an object with all the mongodb collection functions', function() {
            var coll = mod.collection(collName);

            return coll.insert({foo: true})
                .then(function() {
                    return coll.find();
                })
                .call('toArray')
                .then(function(results) {
                    expect(results).to.have.length(1);
                    expect(results[0]).to.have.property('foo', true);
                });
        });
    });

});