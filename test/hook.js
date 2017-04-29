'use strict';

var request = require('supertest');
var fs = require('fs');
var should = require('should');
var assert = require('assert');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var Githook = require('../index.js');

describe('hooks', () => {
    var app;
    var githook;

    function startServer() {

        app = express();
        githook = new Githook();

        app.use(bodyParser.json({
            limit: '1mb'
        }));

        app.post('/github', (req, res) => {
            githook.handleEvent('github', {
                ip: '192.30.252.1',
                headers: req.headers,
                body: req.body
            }, err => {
                if (err) {
                    res.send(400, 'Event not supported');
                } else {
                    res.end();
                }
            });
        });

        app.post('/gitlab', (req, res) => {
            githook.handleEvent('gitlab', {
                headers: req.headers,
                body: req.body
            }, err => {
                if (err) {
                    res.send(400, 'Event not supported');
                } else {
                    res.end();
                }
            });
        });

        app.post('/bitbucket', (req, res) => {
            githook.handleEvent('bitbucket', {
                headers: req.headers,
                body: req.body
            }, err => {
                if (err) {
                    res.send(400, 'Event not supported');
                } else {
                    res.end();
                }
            });
        });

        // error handler
        app.use((err, req, res, next) => {
            console.log("ERROR handler", err);
            res.status(500);
            res.send({
                error: 'Internal Error'
            });
        });

        return app;
    }

    beforeEach(done => {
        app = startServer();
        setTimeout(done, 1000);
    });

    afterEach(done => {
        // nothing to do yet
        done();
    });

    it('bitbucket git', done => {

        var response = {
            "type": "push",
            "user": {
                "name": "marcus"
            },
            "repo": {
                "name": "Project X",
                "owner": "marcus"
            },
            "before": "",
            "after": "",
            "ref": "",
            "commits": [{
                "author": {
                    "email": "",
                    "username": ""
                },
                "message": "Added some more things to somefile.py\n",
                "timestamp": "2012-05-30 05:58:56",
                "url": ""
            }],
            "compare": "https://bitbucket.org/marcus/project-x/"
        };

        githook.on('push', eventdata => {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(eventdata), JSON.stringify(response));
            //console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/bitbucket_git.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/bitbucket')
            .send(json)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
            });
    });

    it('bitbucket mercurial', done => {
        var response = {
            "type": "push",
            "user": {
                "name": "marcus"
            },
            "repo": {
                "name": "Project X",
                "owner": "marcus"
            },
            "before": "",
            "after": "",
            "ref": "",
            "commits": [{
                "author": {
                    "email": "",
                    "username": ""
                },
                "message": "Added some featureA things",
                "timestamp": "2012-05-30 06:07:03",
                "url": ""
            }],
            "compare": "https://bitbucket.org/marcus/project-x/"
        };

        githook.on('push', eventdata => {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(eventdata), JSON.stringify(response));
            //console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/bitbucket_mercurial.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/bitbucket')
            .send(json)
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
            });
    });

    it('github push', done => {
        var response = {
            "type": "push",
            "user": {
                "email": "lolwut@noway.biz",
                "name": "Garen Torikian"
            },
            "repo": {
                "name": "testing",
                "owner": "octokitty",
                "url": "https://github.com/octokitty/testing"
            },
            "before": "17c497ccc7cca9c2f735aa07e9e3813060ce9a6a",
            "after": "1481a2de7b2a7d02428ad93446ab166be7793fbb",
            "ref": "refs/heads/master",
            "commits": [{
                "author": {
                    "email": "lolwut@noway.biz",
                    "name": "Garen Torikian",
                    "username": "octokitty"
                },
                "message": "Test",
                "timestamp": "2013-02-22T13:50:07-08:00",
                "url": "https://github.com/octokitty/testing/commit/c441029cf673f84c8b7db52d0a5944ee5c52ff89"
            }, {
                "author": {
                    "email": "lolwut@noway.biz",
                    "name": "Garen Torikian",
                    "username": "octokitty"
                },
                "message": "This is me testing the windows client.",
                "timestamp": "2013-02-22T14:07:13-08:00",
                "url": "https://github.com/octokitty/testing/commit/36c5f2243ed24de58284a96f2a643bed8c028658"
            }, {
                "author": {
                    "email": "lolwut@noway.biz",
                    "name": "Garen Torikian",
                    "username": "octokitty"
                },
                "message": "Rename madame-bovary.txt to words/madame-bovary.txt",
                "timestamp": "2013-03-12T08:14:29-07:00",
                "url": "https://github.com/octokitty/testing/commit/1481a2de7b2a7d02428ad93446ab166be7793fbb"
            }],
            "compare": "https://github.com/octokitty/testing/compare/17c497ccc7cc...1481a2de7b2a"
        };

        githook.on('push', eventdata => {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(eventdata), JSON.stringify(response));
            //console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/github_push.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/github')
            .set('X-GitHub-Event', 'push')
            .set('X-GitHub-Delivery', '12321')
            .send(json)
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
            });
    });

    it('github issues', done => {
        var response = {
            'type': 'issues'
        };

        githook.on('issues', eventdata => {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(eventdata), JSON.stringify(response));
            //console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/github_issues.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/github')
            .set('X-GitHub-Event', 'issues')
            .set('X-GitHub-Delivery', '12321')
            .send(json)
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
            });
    });

    it('github pull_request', done => {
        var response = {
            "type": "pull_request",
            "user": {
                "username": "octocat",
                "email": null,
                "name": null
            },
            "repo": {
                "name": "Hello-World",
                "full_name": "octocat/Hello-World",
                "owner": "octocat",
                "url": "https://api.github.com/repos/octocat/Hello-World",
                "git_url": "git://github.com/octocat/Hello-World.git",
                "clone_url": "https://github.com/octocat/Hello-World.git"
            },
            "ref": "new-topic",
            "sha": "6dcb09b5b57875f334f61aebed695e2e4193db5e",
            "message":"Please pull these awesome changes",
            "commits": 3,
            "url": "https://api.github.com/repos/octocat/Hello-World/pulls/1",
            "html_url": "https://github.com/octocat/Hello-World/pull/1"
        };

        githook.on('pull_request', eventdata => {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 

            assert.equal(JSON.stringify(eventdata), JSON.stringify(response));
            //console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/github_pull_request.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/github')
            .set('X-GitHub-Event', 'pull_request')
            .set('X-GitHub-Delivery', '12321')
            .send(json)
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
            });
    });

    it('github issue comment', done => {
        var response = {
            'type': 'issue_comment'
        };

        githook.on('issue_comment', eventdata => {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(eventdata), JSON.stringify(response));
            //console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/github_issue_comment.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/github')
            .set('X-GitHub-Event', 'issue_comment')
            .set('X-GitHub-Delivery', '12321')
            .send(json)
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
            });
    });

    it('github fork', done => {
        var response = {
            'type': 'fork'
        };

        githook.on('fork', eventdata => {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(eventdata), JSON.stringify(response));
            //console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/github_fork.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/github')
            .set('X-GitHub-Event', 'fork')
            .set('X-GitHub-Delivery', '12321')
            .send(json)
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
            });
    });

    it('github ping', done => {
        var response = {
            'type': 'ping',
            'zen': 'Responsive is better than fast.'
        };

        githook.on('ping', eventdata => {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(eventdata), JSON.stringify(response));
            //console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/github_ping.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/github')
            .set('X-GitHub-Event', 'ping')
            .set('X-GitHub-Delivery', '12321')
            .send(json)
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
            });
    });

    it('gitlab 6', done => {
        var response = {
            "type": "push",
            "user": {
                "name": "John Smith"
            },
            "repo": {
                "name": "Diaspora",
                "owner": ""
            },
            "before": "95790bf891e76fee5e1747ab589903a6a1f80f22",
            "after": "da1560886d4f094c3e6c9ef40349f7d38b5d27d7",
            "ref": "refs/heads/master",
            "commits": [{
                "author": {
                    "email": "jordi@softcatala.org",
                    "name": "Jordi Mallach",
                    "username": ""
                },
                "message": "Update Catalan translation to e38cb41.",
                "timestamp": "2011-12-12T14:27:31+02:00",
                "url": "http://localhost/diaspora/commits/b6568db1bc1dcd7f8b4d5a946b0b91f9dacd7327"
            }, {
                "author": {
                    "email": "gitlabdev@dv6700.(none)",
                    "name": "GitLab dev user",
                    "username": ""
                },
                "message": "fixed readme",
                "timestamp": "2012-01-03T23:36:29+02:00",
                "url": "http://localhost/diaspora/commits/da1560886d4f094c3e6c9ef40349f7d38b5d27d7"
            }],
            "compare": "http://localhost/diaspora/compare/95790bf891e76fee5e1747ab589903a6a1f80f22...da1560886d4f094c3e6c9ef40349f7d38b5d27d7"
        };

        githook.on('push', eventdata => {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(eventdata), JSON.stringify(response));
            // console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/gitlab6.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/gitlab')
            .send(json)
            .expect(200)
            .end((err, res) => {
                should.not.exist(err);
            });
    });
});