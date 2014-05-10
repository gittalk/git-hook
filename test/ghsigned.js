'use strict';

var request = require('supertest'),
    fs = require('fs'),
    should = require('should'),
    assert = require('assert'),
    path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser'),
    Githook = require('../index.js');

var secret = 'MYSECRET',
    ghSignature = require('../middleware/ghsignature');

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

describe('github signed hooks', function () {
    var app;
    var githook;

    function startServer() {

        app = express();
        githook = new Githook({
            github: {
                secret: secret,
                // token : 'yourgithubtoken'
            }
        });

        app.use(bodyParser.json({
            limit: '1mb',
            hook: function (req, raw) {
                req._ghsignature = ghSignature.calculateSignature(secret, raw);
            }
        }));

        app.post('/github', [ghSignature.verify({
                secret: secret
            }),
            function (req, res) {
                githook.handleEvent('github', {
                    ip: '192.30.252.1',
                    headers: req.headers,
                    body: req.body
                }, function (err) {
                    if (err) {
                        res.send(400, 'Event not supported');
                    } else {
                        res.end();
                    }
                });
            }
        ]);

        app.post('/gitlab', function (req, res) {
            githook.handleEvent('gitlab', {
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

        app.post('/bitbucket', function (req, res) {
            githook.handleEvent('bitbucket', {
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

        // error handler
        app.use(function (err, req, res, next) {
            res.status(400);
            res.send({
                error: 'Bad Request'
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

    it('request with signature', function (done) {

        githook.on('push', function (eventdata) {
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
            .set('X-Hub-Signature', ghSignature.calculateSignature(secret, JSON.stringify(json)))
            .send(json)
            .expect(200)
            .end(function (err, res) {
                should.not.exist(err);
            });
    });

    it('request with changed body', function (done) {

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/github_push.json'));
        var json = JSON.parse(data);
        var signature = ghSignature.calculateSignature(secret, JSON.stringify(json));

        var changedjson = JSON.parse(data);
        changedjson.number = 2;

        request(app)
            .post('/github')
            .set('X-GitHub-Event', 'push')
            .set('X-GitHub-Delivery', '12321')
            .set('X-Hub-Signature', signature)
            .send(changedjson)
            .expect(400)
            .end(function (err, res) {
                should.not.exist(err);
                done();
            });
    });

    it('request without signature', function (done) {

        var data = fs.readFileSync(path.resolve(__dirname, './hooks/github_push.json'));
        var json = JSON.parse(data);
        request(app)
            .post('/github')
            .set('X-GitHub-Event', 'push')
            .set('X-GitHub-Delivery', '12321')
            .send(json)
            .expect(400)
            .end(function (err, res) {
                should.not.exist(err);
                done();
            });
    });
});