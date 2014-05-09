'use strict';

var util = require('util'),
    debug = require('debug')('githook'),
    EventEmitter = require('events').EventEmitter,
    services = require('./services');

/**
 * With Githook we react on github, bitbucket and gitlab hooks and submit
 * a harmonized event.
 *
 * Whenever we got an event, we tranform this event into the following format:
 *
 * {
 *     "repo": {
 *         "name": "Project X",
 *         "owner": "marcus",
 *     },
 *     "event" : {
 *         "type" : "pull"
 *         "message" : "Added some more things to somefile.py\n"
 *     },
 *     "raw" : "{raw event}"
 * }
 */
function Githook() {
    EventEmitter.call(this);
}
util.inherits(Githook, EventEmitter);

/*
 * handle the data of the a git event
 */
Githook.prototype.handleEvent = function (service, data, callback) {
    debug('handle ' + service);
    var self = this;
    services[service].verify(data).then(function () {
        debug('request is verified');
        return services[service].extract(data.headers, data.body);
    })
    .then(function (json) {
        self.sendevent(json);

    }).
    catch (function (err) {
        var error = err ||  'An error occured';
        callback(error);
    });
};

/**
 * determine the ip adress of the http requestor
 */
Githook.prototype.determineIP = function (req) {
    // it does not use req.headers['x-forwarded-for']
    // because this can be malipulated
    var ip = req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ip;
};

/** 
 * emits the git event
 */
Githook.prototype.sendevent = function (eventData) {
    debug('emit event: ' + JSON.stringify(eventData));
    this.emit(eventData.type, eventData);
};

module.exports = Githook;