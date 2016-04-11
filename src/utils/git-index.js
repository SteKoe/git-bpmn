'use strict';
var _fs = require('fs');

exports = module.exports = function (repository) {
    return {
        add: add,
        contents: contents,
        size: size
    };

    function add(entry) {
        _fs.appendFileSync([repository.root, repository.metaDir, repository.index].join('/'), entry + '\n', 'utf8')
    }

    function contents() {
        let contents = _fs.readFileSync([repository.root, repository.metaDir, repository.index].join('/'), 'utf8');
        contents = contents.split('\n').filter(s => s && s.length > 0).sort((a,b) => b.length - a.length);
        return contents;
    }

    function size() {
        return this.contents().length;
    }
};

