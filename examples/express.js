'use strict';

var express = require('express'),
    debug = require('debug')('api'),
    bodyParser = require('body-parser'),
    Githook = require('../index');

var app = express();
var gh = new Githook();

app.use(bodyParser.json({ limit: '1mb' }));

app.get('/', function(req, res){
    res.send('hello world');
});

app.post('/github', function (req, res) {
    debug('github event');
    gh.handleroute('github', req.headers, req.body, function (err) {
        if (err) {
            res.send(400, 'Event not supported');
        } else {
            res.end();
        }
    });
});

app.post('/gitlab', function (req, res) {
    debug('gitlab event');
    gh.handleroute('gitlab', req.headers, req.body, function (err) {
        if (err) {
            res.send(400, 'Event not supported');
        } else {
            res.end();
        }
    });
});

app.post('/bitbucket', function (req, res) {
    debug('bitbucket event');
    gh.handleroute('bitbucket', req.headers, req.body, function (err) {
        if (err) {
            res.send(400, 'Event not supported');
        } else {
            res.end();
        }
    });
});

app.listen(3001);