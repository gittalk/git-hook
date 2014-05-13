# git-hook

[![build status](https://secure.travis-ci.org/gittalk/git-hook.png)](http://travis-ci.org/gittalk/git-hook)

Why? This nodejs module implements expressjs routes to react on github, bitbucket and gitlab push hooks. The events are parsed, translated into a common format and emitted to your javascript implementation.

Under development

# Supported event types

✔ supported, ∅ not supported by this service, ✘ not supported by git-hook (yet)

| Event Type    | Github     | Bitbucket | Gitlab    | Description |
| ------------- | ---------- | --------- | --------- | ----------- |
|push | ✔ | ✔ | ✔  | Any git push to a Repository. This is the default event. |
|issues | ✘ | ∅ | ∅ | Any time an Issue is opened or closed. |
|issue_comment | ✘ | ∅ | ∅ | Any time an Issue is commented on. |
|commit_comment | ✘ | ∅ | ∅ | Any time a Commit is commented on. |
|create  | ✘ | ∅ | ∅ | Any time a Repository, Branch, or Tag is created. |
|delete  | ✘ | ∅ | ∅ | Any time a Branch or Tag is deleted. |
|pull_request  | ✔ | ✘ | ∅ | Any time a Pull Request is opened, closed, or synchronized (updated due to a new push in the branch that the pull request is tracking). |
|pull_request_review_comment  | ✘ | ✘ | ∅ | Any time a Commit is commented on while inside a Pull Request review (the Files Changed tab). |
|gollum  | ✘ | ∅ | ∅ |  Any time a Wiki page is updated. |
|watch  | ✘ | ∅ | ∅ |  Any time a User watches the Repository. |
|release  | ✘ | ∅ | ∅ |  Any time a Release is published in the Repository. |
|fork  | ✘ | ∅ | ∅ |  Any time a Repository is forked. |
|member  | ✘ | ∅ | ∅ |  Any time a User is added as a collaborator to a non-Organization Repository. |
|public | ✘ | ∅ | ∅ |   Any time a Repository changes from private to public. |
|team_add  | ✘ | ∅ | ∅ | Any time a team is added or modified on a Repository. |
|status | ✘ | ∅ | ∅ | Any time a Repository has a status update from the API |

More information is available at [Github](http://developer.github.com/v3/repos/hooks/), [Bitbucket Pull Request POST hook ](https://confluence.atlassian.com/display/BITBUCKET/Pull+Request+POST+hook+management), [POST hook management](https://confluence.atlassian.com/display/BITBUCKET/POST+hook+management), [Gitlab](http://api.gitlab.org/system_hooks.html)

# Usage

```javascript

// create githook instance
var githook = new Githook({
    github: {
        secret: secret,
        // token : 'yourgithubtoken'
    }
});

// bind a route to githook, eg. express 4.0
app.post('/github', function (req, res) {
    debug('github event');
    gh.handleEvent('github', {
        ip: githook.determineIP(req),
        headers: req.headers,
        body: req.body
    }, function (err) {
        if (err) {
            res.send(400, 'Event not supported');
        } else {
            res.end();
        }
    });
});

// wait for git events
githook.on('push', function (eventdata) {
    // do your magic here
});

```


# Configuration

Currently only the `github` service can be configured. 

    github: {
        // @see https://developer.github.com/v3/repos/hooks/#create-a-hook
        secret: signaturesecret,
        // @see https://developer.github.com/v3/oauth/
        token : 'yourgithubtoken'
    }


# Contributing

Any contributions are welcome!

1. Fork the repository on Github
2. Create a named feature branch (like `add_component_x`)
3. Write you change
4. Write tests for your change (if applicable)
5. Run the tests, ensuring they all pass
6. Submit a Pull Request using Github

# License and Author

Author: Christoph Hartmann <chris@lollyrock.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
