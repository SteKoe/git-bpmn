'use strict';
var _shasum = require('shasum');

import GitObject from './git-object';

export default {
    entity: hash('entity'),
    node: hash('node'),
    diagram: hash('diagram'),
    commit: hash('commit')
};

function hash(type) {
    return function (content) {
        var buffer = GitObject[type](content);
        return _shasum(buffer);
    }
}

function hashTree(content) {
    var a = content.split('\n')
        .filter(c => c !== "")
        .map(c => {
            var splitted = c.split(/\s|\t/g);
            var mode = (+splitted[0]).toString();
            var sha = splitted[2];
            var filename = splitted[3];

            var items = [
                new Buffer(mode, 'utf8'),
                new Buffer(' '),
                new Buffer(filename, 'utf8'),
                new Buffer('\0'),
                new Buffer(sha, 'hex')
            ];
            return Buffer.concat(items);
        });

    let buffer = Buffer.concat(a);
    return hash('tree')(buffer);
}

function bytes(s) {
    if(typeof s === 'object') {
        return s.length.toString();
    }
    return Buffer.byteLength(s).toString()
}