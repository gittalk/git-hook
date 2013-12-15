'use strict';

var request = require('supertest'),
    fs = require('fs'),
    should = require('should'),
    assert = require('assert'),
    path = require('path'),
    express = require('express'),
    Githook = require('../index.js');

describe('hooks', function () {
    var app;
    var githook;

    function startServer() {

        app = express();
        app.use(express.bodyParser());
        app.use(express.methodOverride());

        githook = new Githook(app);

        // error handler
        app.use(function (err, req, res, next) {
            console.log("ERROR handler", err);
            res.status(500);
            res.send({
                error: 'Internal Error'
            });
        });

        return app;
    }


    beforeEach(function (done) {
        app = startServer();
        setTimeout(done, 1000);
    });

    afterEach(function (done) {
        // nothing to do yet
        done();
    });

    it('bitbucket git', function (done) {

        var response = {
            "type": "push",
            "user": {
                "name": "marcus"
            },
            "repo": {
                "name": "Project X",
                "owner": "marcus"
            },
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

        githook.on('push', function (eventdata) {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(response), JSON.stringify(eventdata));
            // console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/bitbucket_git.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/bitbucket')
            .send(json)
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                should.not.exist(err);
            });
    });

    it('bitbucket mercurial', function (done) {
        var response = {
            "type": "push",
            "user": {
                "name": "marcus"
            },
            "repo": {
                "name": "Project X",
                "owner": "marcus"
            },
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

        githook.on('push', function (eventdata) {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(response), JSON.stringify(eventdata));
            // console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/bitbucket_mercurial.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/bitbucket')
            .send(json)
            .expect(200)
            .end(function (err, res) {
                should.not.exist(err);
            });
    });

    it('github', function (done) {
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

        githook.on('push', function (eventdata) {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(response), JSON.stringify(eventdata));
            // console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/github.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/github')
            .send(json)
            .expect(200)
            .end(function (err, res) {
                should.not.exist(err);
            });
    });

    it('gitlab 6', function (done) {
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

        githook.on('push', function (eventdata) {
            delete eventdata.raw;
            // this is not a secure test, because JSON does not garantie a specific order
            // anyway it works for our tests 
            assert.equal(JSON.stringify(response), JSON.stringify(eventdata));
            // console.log(JSON.stringify(eventdata));
            done();
        });

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/gitlab6.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/gitlab')
            .send(json)
            .expect(200)
            .end(function (err, res) {
                should.not.exist(err);
            });
    });
});