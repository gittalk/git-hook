'use strict';

var express = require('express'),
    debug = require('debug')('api'),
    bodyParser = require('body-parser'),
    Githook = require('../index');

var app = express();
var gh = new Githook();

app.use(bodyParser.json({
    limit: '1mb'
}));

app.get('/', function (req, res) {
    res.send('hello world');
});

app.post('/github', function (req, res) {
    debug('github event');
    gh.handleEvent('github', {
        ip: '192.30.252.1', // gh.determineIP(req),
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

app.post('/gitlab', function (req, res) {
    debug('gitlab event');
    gh.handleEvent('gitlab', {
        ip: gh.determineIP(req),
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
    debug('bitbucket event');
    gh.handleEvent('bitbucket', {
        ip: gh.determineIP(req),
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

app.listen(3001);
console.log('started server on port 3001');