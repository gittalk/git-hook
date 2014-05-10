'use strict';

var crypto = require('crypto'),
    debug = require('debug')('githook:ghsignature');

/**
 * implements a express middleware to verify signatures of github events
 */
exports = module.exports = {
    // express middleware
    verify: verify,
    // helper methids
    checkSignature: checkSignature,
    calculateSignature: calculateSignature
};

/**
 * Verify signed github requests
 * @see https://developer.github.com/v3/repos/hooks/#create-a-hook
 */
function verify(options) {
    var _secret = options.secret ||  null;

    return function verify(req, res, next) {
  
        // extract secret header
        var XHubSignature = req.headers['x-hub-signature'];

        if (checkSignature(_secret, XHubSignature, req._ghsignature)) {
            next();
        } else {
            debug('signature is not valid');
            next('signature error');
        }

    };
}

/**
 * compares the signatures
 */
function checkSignature(secret, githubsignature, calcsignature) {
    
    var verified = false;

    // check if the header is there
    if (githubsignature) {
        if (githubsignature === calcsignature) {
            verified = true;
        }
    }
    // header is missing, check if we have a secret
    // all hooks with secrets are signed
    else {
        // abort if we have a secret but no header
        if (!secret) {
            verified = true;
        }
    }

    debug('verify signatures ' + githubsignature + ' and ' + calcsignature + '. Verifed: ' + verified);

    return verified;
}

/** 
 * generate a sha1 hash from string
 */
function calculateSignature(secret, raw) {
    if (secret) {
        // create hahs
        var hash = crypto.createHmac('sha1', secret);
        hash.update(raw);
        var value = hash.digest('hex');

        return 'sha1=' + value;
    } else {
        return null;
    }
}