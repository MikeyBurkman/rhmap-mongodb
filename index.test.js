'use strict';

var Promise = require('bluebird');
var env = require('env-var');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var expect = require('chai').expect;

describe(__filename, function() {
    var connectStub;
    var mockEnv;

    beforeEach(function() {
        connectStub = sinon.stub();
        mockEnv = {};
    });

    function getModule() {
        return proxyquire('./index', {
            mongodb: {
                MongoClient: {
                    connect: connectStub
                }
            },
            'env-var': env.mock(mockEnv)
        });
    }

    it('Should connect successfully', function() {
        var collectionStub = sinon.stub().returns('foo');
        connectStub.returns(Promise.resolve({
            collection: collectionStub
        }));

        return getModule().collection('foo').then(function(result) {
            expect(result).to.eql('foo');
            expect(connectStub.callCount).to.eql(1);
        });
    });

    it('Should continue trying to connect', function() {
        mockEnv = {
            RHMAP_MONGO_CONNECT_RETRY_INTERVAL: 200
        };

        connectStub.onCall(0).returns(Promise.reject(new Error('first error')));
        connectStub.onCall(1).returns(Promise.reject(new Error('second error')));

        var collectionStub = sinon.stub().returns('bar');
        connectStub.onCall(2).returns(Promise.resolve({
            collection: collectionStub
        }));

        return getModule().collection('foo').then(function(result) {
            expect(result).to.eql('bar');
            expect(connectStub.callCount).to.eql(3);
        });
    });
});