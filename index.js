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
 * handle the POST request data and extract the required information
 */
Githook.prototype.handleroute = function (service, header, body, callback) {
    debug('handle ' + service)
    var self = this;
    services[service].verify(body, function (err) {
        if (!err) {
            services[service].extract(header, body, function (err, json) {
                if (!err) {
                    self.eventhandler(json);
                }
                callback(err);
            });
        } else {
            callback(err);
        }
    });
};

/** 
 * emits the git event
 */
Githook.prototype.eventhandler = function (eventData) {
    this.emit(eventData.type, eventData);
};

module.exports = Githook;