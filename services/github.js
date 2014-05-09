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
 * extract data from pull request
 */
function extractPushEvent(data, callback)  {
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

    callback(null, eventData);
}

function extractPullRequestEvent (data, callback) {

    var eventData = {
        'type': 'pull_request',
        'user': {
            'username' : data.pull_request.head.user.login,
            'email': null,
            'name': null
        },
        'repo': {
            'name': data.pull_request.head.repo.name,
            'owner': data.pull_request.head.repo.owner.login,
            'url': data.pull_request.head.repo.url,
            'clone' : data.pull_request.head.repo.clone_url
        },
        'ref': data.pull_request.head.ref,
        'commits': data.pull_request.commits,
        'raw': data
    };

    callback(null, eventData);
}

/* 
 * extract the data
 */
function extract(header, data, callback) {
    // extract event type
    var ghevent = header['X-GitHub-Event'.toLowerCase()];
    switch (ghevent) {
    case 'push':
        extractPushEvent(data, callback);
        break;
    case 'pull_request':
        extractPullRequestEvent(data, callback);
        break;
    case 'issues':
    case 'issue_comment':
    case 'fork':
        // for now we return an empty object
        callback(null, {
            'type': ghevent,
            'raw': data
        });
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
