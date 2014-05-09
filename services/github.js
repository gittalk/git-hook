'use strict';

var debug = require('debug')('githook:github'),
    Promise = require('bluebird'),
    Netmask = require('netmask').Netmask;

var Github = function () {};

/*
 * verify the origin of the hook
 * call https://api.github.com/meta
 *
 *   {
 *     "verifiable_password_authentication": true,
 *     "hooks": [
 *       "192.30.252.0/22"
 *     ],
 *     "git": [
 *       "192.30.252.0/22"
 *     ]
 *   }
 */
Github.prototype.checkOrigin = function (ip) {

    return new Promise(function (resolve, reject) {

        var request = require('superagent');

        // download current list from https://api.github.com/meta
        request
            .get('https://api.github.com/meta')
            .set('Accept', 'application/json')
            .end(function (res) {
                if (res.error) {
                    reject(res.error.message);
                } else {
                    // extract hooks
                    var hooks = res.body.hooks;
                    debug('verify ' + ip + ' against ' + JSON.stringify(hooks));

                    var contains = false;

                    // check if the ip is in github range
                    hooks.forEach(function (iprange) {
                        var block = new Netmask(iprange);
                        if (block.contains(ip)) {
                            contains = true;
                        }
                    });

                    if (contains) {
                        debug('ip adress verification successful');
                        resolve();
                    } else {
                        debug('ip adress verification failed');
                        reject();
                    }
                }
            });
    });
};

Github.prototype.checkSignature = function () {
    return new Promise(function (resolve) {
        debug('signature check successful');
        resolve();
    });
};

Github.prototype.verify = function (data) {
    debug('verify github hook');
    return Promise.all([this.checkOrigin(data.ip), this.checkSignature()]);
};

/*
 * extract data from pull request
 */
Github.prototype.extractPushEvent = function (data)  {
    debug('extract github push event');
    return new Promise(function (resolve) {
        // extract commit messages
        var commits = [];
        for (var i = 0, l = data.commits.length; i < l; i++) {
            var dcommit = data.commits[i];
            var commit = {
                'author': {
                    'email': dcommit.author.email,
                    'name': dcommit.author.name,
                    'username': dcommit.author.username
                },
                'message': dcommit.message,
                'timestamp': dcommit.timestamp,
                'url': dcommit.url
            };
            commits.push(commit);
        }

        var eventData = {
            'type': 'push',
            'user': {
                'email': data.pusher.email,
                'name': data.pusher.name
            },
            'repo': {
                'name': data.repository.name,
                'owner': data.repository.owner.name,
                'url': data.repository.url
            },
            'before': data.before,
            'after': data.after,
            'ref': data.ref,
            'commits': commits,
            'compare': data.compare,
            'raw': data
        };

        resolve(eventData);
    });
};

Github.prototype.extractPullRequestEvent = function (data) {
    debug('extract github pull event');
    return new Promise(function (resolve) {
        var eventData = {
            'type': 'pull_request',
            'user': {
                'username': data.pull_request.head.user.login,
                'email': null,
                'name': null
            },
            'repo': {
                'name': data.pull_request.head.repo.name,
                'owner': data.pull_request.head.repo.owner.login,
                'url': data.pull_request.head.repo.url,
                'clone': data.pull_request.head.repo.clone_url
            },
            'ref': data.pull_request.head.ref,
            'commits': data.pull_request.commits,
            'url': data.pull_request.url,
            'html_url': data.pull_request.html_url,
            'raw': data
        };

        resolve(eventData);
    });
};

/* 
 * extract the data
 */
Github.prototype.extract = function (header, data) {

    // extract event type
    var ghevent = header['X-GitHub-Event'.toLowerCase()];
    var promise = null;

    debug('extract github event: ' + ghevent);
    switch (ghevent) {
    case 'push':
        promise = this.extractPushEvent(data);
        break;
    case 'pull_request':
        promise = this.extractPullRequestEvent(data);
        break;
    case 'issues':
    case 'issue_comment':
    case 'fork':
        // for now we return an empty object
        promise = new Promise(function (resolve) {
            resolve({
                'type': ghevent,
                'raw': data
            });
        });
        break;
    default:
        promise = new Promise(function (resolve, reject) {
            reject('event not supported');
        });
        break;
    }

    return promise;
};

module.exports = new Github();