'use strict';

/*
 * verify the sender of the hook
 */
function verify(data, callback) {

    // call https://api.github.com/meta
    /* 
    {
      "verifiable_password_authentication": true,
      "hooks": [
        "192.30.252.0/22"
      ],
      "git": [
        "192.30.252.0/22"
      ]
    }*/

    callback(null);
}

/* 
 * extract the data
 */
function extract(data, callback) {

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
            'timestamp' : dcommit.timestamp,
            'url' : dcommit.url
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
        'before':data.before,
        'after':data.after,
        'ref': data.ref,
        'commits': commits,
        'compare': data.compare,
        'raw': data
    };

    callback(null, eventData);
}

module.exports = {
    'verify': verify,
    'extract': extract
};