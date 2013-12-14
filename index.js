'use strict';

var util = require('util'),
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
function Githook(app) {
    EventEmitter.call(this);
    this.app = app;
    this.initialize();
}
util.inherits(Githook, EventEmitter);

/** 
 * initialize the express app variable with the routes to handle web hook
 * events
 */
Githook.prototype.initialize = function () {
    var self = this;
    this.app.post('/github', function (req, res) {
        self.handleroute('github', req.body, function (err) {
            if (err) {
                res.error(err);
            } else {
                res.end();
            }
        });
    });

    this.app.post('/gitlab', function (req, res) {
        self.handleroute('gitlab', req.body, function (err) {
            if (err) {
                res.error(err);
            } else {
                res.end();
            }
        });
    });

    this.app.post('/bitbucket', function (req, res) {
        self.handleroute('bitbucket', req.body, function (err) {
            if (err) {
                res.error(err);
            } else {
                res.end();
            }
        });
    });
};

/*
 * handle the POST request data and extract the required information
 */
Githook.prototype.handleroute = function (service, rawEventData, callback) {
    var self = this;
    services[service].verify(rawEventData, function (err) {
        if (!err) {
            services[service].extract(rawEventData, function (err, json) {
                self.eventhandler(json);
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