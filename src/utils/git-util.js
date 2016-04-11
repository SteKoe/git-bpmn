'use strict';
let _mkdirp = require('mkdirp');
let _fs = require('fs');
let _zlib = require('zlib');

exports = module.exports = function(repository) {
    return {
        writeObject: writeObject
    };

    function writeObject(sha1, content) {
        let objectsFolder = [repository.root, repository.metaDir, 'objects'].join('/');
        let parts = sha1.match(/../g) || [];
        let objectFileName = sha1.substr(2);
        objectsFolder = [objectsFolder, parts.shift()].join('/');
        _mkdirp.sync(objectsFolder);
        _fs.writeFileSync([objectsFolder, objectFileName].join('/'), content, 'utf8');
    }
};

