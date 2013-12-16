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
        self.handleroute('github', req.headers, req.body, function (err) {
            if (err) {
                res.send(400, 'Event not supported');
            } else {
                res.end();
            }
        });
    });

    this.app.post('/gitlab', function (req, res) {
        self.handleroute('gitlab', req.headers, req.body, function (err) {
            if (err) {
                res.send(400, 'Event not supported');
            } else {
                res.end();
            }
        });
    });

    this.app.post('/bitbucket', function (req, res) {
        self.handleroute('bitbucket', req.headers, req.body, function (err) {
            if (err) {
                res.send(400, 'Event not supported');
            } else {
                res.end();
            }
        });
    });
};

/*
 * handle the POST request data and extract the required information
 */
Githook.prototype.handleroute = function (service, header, body, callback) {
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