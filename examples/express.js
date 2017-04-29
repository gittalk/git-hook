'use strict';

var express = require('express');
var debug = require('debug')('api');
var bodyParser = require('body-parser');
var Githook = require('../index');

var app = express();
var gh = new Githook();

app.use(bodyParser.json({
    limit: '1mb'
}));

app.get('/', (req, res) => {
    res.send('hello world');
});

app.post('/github', (req, res) => {
    debug('github event');
    gh.handleEvent('github', {
        ip: '192.30.252.1', // gh.determineIP(req),
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
    debug('gitlab event');
    gh.handleEvent('gitlab', {
        ip: gh.determineIP(req),
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
    debug('bitbucket event');
    gh.handleEvent('bitbucket', {
        ip: gh.determineIP(req),
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

app.listen(3001);
console.log('started server on port 3001');