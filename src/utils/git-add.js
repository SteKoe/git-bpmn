'use strict';
let _glob = require('glob');
let _fs = require('fs');

let GitHash = require('./git-hash');
let GitIndex = require('./git-index');
let GitUtil = require('./git-util');

exports = module.exports = function (repository) {
    return function add(folder) {
        let filesInFolder = _glob.sync([repository.root, folder, '**/*.*'].join('/'));

        let treeObjectContents = filesInFolder.map(file => {
            let mode = '100644';
            let name = relativizePath(file);
            let sha1 = calculateHash(file);

            GitIndex(repository).add(name);

            GitUtil(repository).writeObject(sha1, _fs.readFileSync(file, 'utf8'));

            return `${mode} blob ${sha1}\t${name}`;
        });
    };

    function calculateHash(path) {
        var readFile = _fs.readFileSync(path, 'utf8');
        return GitHash.blob(readFile);
    }

    function relativizePath(path) {
        return path.split(repository.root).join('').substr(1);
    }

    function exists(path) {
        try {
            _fs.statSync(path);
            return true;
        } catch (e) {
            return false;
        }
    }
};
