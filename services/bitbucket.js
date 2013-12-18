'use strict';

var url = require('url');

/*
 * verify the sender of the hook
 */

function verify(data, callback) {
    // verify sender: 131.103.20.165 and 131.103.20.166
    callback(null);
}


function extractPushEvent(data, callback) {
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

    callback(null, eventData);
}


/* 
 * extract the data
 */

function extract(header, data, callback) {
    var bbevent;

    if (data && data.payload) {
        bbevent = 'push';
    }

    switch (bbevent) {
    case 'push':
        extractPushEvent(data.payload, callback);
        break;
    default:
        callback('event not supported');
        break;
    }

}

module.exports = {
    'verify': verify,
    'extract': extract
};
