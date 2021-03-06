'use strict';

var debug = require('debug')('githook:gitlab'),
    Promise = require('bluebird');

var Gitlab = function () {};

/*
 * verify the sender of the hook
 */
Gitlab.prototype.verify = function (data) {
    debug('verify gitlab hook: '+ JSON.stringify(data));
    //use environment variable: HOOK_GITLAB_SENDER
    return new Promise(function (resolve) {
        resolve();
    });
};

/* 
 * extract the data
 */
Gitlab.prototype.extract = function (header, data) {

    return new Promise(function (resolve) {

        // extract commit messages
        var commits = [];
        for (var i = 0, l = data.commits.length; i < l; i++) {
            var dcommit = data.commits[i];
            var commit = {
                'author': {
                    'email': dcommit.author.email,
                    'name': dcommit.author.name,
                    'username': ''
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
                'name': data.user_name
            },
            'repo': {
                'name': data.repository.name,
                'owner': ''
            },
            'before': data.before,
            'after': data.after,
            'ref': data.ref,
            'commits': commits,
            'compare': data.repository.homepage + '/compare/' + data.before + '...' + data.after,
            'raw': '{raw event}'
        };

        resolve(eventData);
    });

};

module.exports = Gitlab;