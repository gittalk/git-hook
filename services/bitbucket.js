'use strict';

var debug = require('debug')('githook:bitbucket'),
    url = require('url'),
    Promise = require('bluebird');

var Bitbucket = function () {};

/*
 * verify the sender of the hook
 */
Bitbucket.prototype.verify = function (data) {
    // verify sender: 131.103.20.165 and 131.103.20.166
    debug('verify bitbucket hook: ' + JSON.stringify(data));
    return new Promise(function (resolve) {
        resolve();
    });
};

Bitbucket.prototype.extractPushEvent = function (data) {

    return new Promise(function (resolve) {
        // extract commit messages
        var commits = [];
        for (var i = 0, l = data.commits.length; i < l; i++) {
            var dcommit = data.commits[i];
            var commit = {
                'author': {
                    'email': '',
                    'name': dcommit.author.name,
                    'username': ''
                },
                'message': dcommit.message,
                'timestamp': dcommit.timestamp,
                'url': ''
            };
            commits.push(commit);
        }

        var eventData = {
            'type': 'push',
            'user': {
                'name': data.user
            },
            'repo': {
                'name': data.repository.name,
                'owner': data.repository.owner
            },
            'before': '',
            'after': '',
            'ref': '',
            'commits': commits,
            'compare': url.resolve(data.canon_url, data.repository.absolute_url),
            'raw': data
        };

        resolve(eventData);
    });
};


/* 
 * extract the data
 */

Bitbucket.prototype.extract = function (header, data) {
    var bbevent;

    if (data && data.payload) {
        bbevent = 'push';
    }

    var promise = null;

    switch (bbevent) {
    case 'push':
        var pushdata = JSON.parse(data.payload);
        promise = this.extractPushEvent(pushdata);
        break;
    default:
        promise = new Promise(function (resolve, reject) {
            reject('event not supported');
        });
        break;
    }

    return promise;

};

module.exports = new Bitbucket();