'use strict';

/*
 * verify the sender of the hook
 */
function verify(data, callback) {
    //use environment variable: HOOK_GITLAB_SENDER
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
        'before':data.before,
        'after':data.after,
        'ref': data.ref,
        'commits': commits,
        'compare': data.repository.homepage + '/compare/' + data.before + '...' + data.after,
        'raw': '{raw event}'
    };

    callback(null, eventData);
}

module.exports = {
    'verify': verify,
    'extract': extract
};