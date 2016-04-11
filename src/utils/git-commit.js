'use strict';
let _glob = require('glob');
let _fs = require('fs');
let _path = require('path');

let GitHash = require('./git-hash');
let GitIndex = require('./git-index');
let GitUtil = require('./git-util');

exports = module.exports = function (repository) {
    var cache = {};

    return function commit(message) {
        if (GitIndex(repository).size() === 0) {
            throw new Error('Nothing to commit!');
        }

        if(!repository.author || !repository.email) {
            throw new Error('Who are you? You have to set your name and mail!');
        }

        let indexEntries = GitIndex(repository).contents().map(c => _path.dirname(c));
        indexEntries = new Set(indexEntries);
        let paths = Array.from(indexEntries)
            .map(a => getAllParentPaths(a))
            .reduce((prev, cur) => prev.concat(cur), ['.'])
            .reverse()
            .forEach(writeTree);

        let commitDate = Math.round(Date.now()/1000);
        let commit = [
            `tree ${cache['.']}`,
            `author ${repository.author} <${repository.email}> ${commitDate} +0100`,
            `committer ${repository.author} <${repository.email}> ${commitDate} +0100`,
            ``,
            message,
            ``
        ].join('\n');

        let commitHash = GitHash.commit(commit);
        GitUtil(repository).writeObject(commitHash, commit);
    };

    function writeTree(path) {
        let content = _glob.sync([repository.root, path, '*'].join('/'))
            .map(c => {
                let stat = _fs.statSync(c);
                let basename = _path.basename(c);

                if(stat.isFile()) {
                    let hash = GitHash.blob(_fs.readFileSync(c, 'utf8'));
                    return `100644 blob ${hash}\t${basename}`;
                } else {
                    let hash = cache[basename];
                    return `040000 tree ${hash}\t${basename}`;
                }
            }).join('\n');

        var treeHash = GitHash.tree(content);
        cache[path] = treeHash;
        GitUtil(repository).writeObject(treeHash, content);
    }

    function getAllParentPaths(childPath) {
        var paths = [];
        let pathParts = childPath.split('/');
        while (pathParts.length > 0) {
            paths.push(pathParts.join('/'));
            pathParts.pop();
        }
        return paths;
    }
};

