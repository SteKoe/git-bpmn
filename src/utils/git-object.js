import GitHash from './git-hash';

export default {
    entity: object('entity'),
    node: object('node'),
    diagram: object('diagram'),
    tree: tree
};

function object(type) {
    return function (content) {
        var byteLength = bytes(content);
        var items = [
            new Buffer(type),
            new Buffer(' '),
            new Buffer(byteLength),
            new Buffer('\0'),
            new Buffer(content)
        ];
        return Buffer.concat(items);
    }
}

function tree(contents) {
    return contents.map(c => {
            let hash;
            const gitHash = GitHash[c.type];
            if (gitHash) {
                hash = gitHash(JSON.stringify(c));
                return `000000 ${c.type} ${hash}\t${c.name}`;
            }
        })
        .filter(f => f)
        .join('\n')
}

function bytes(s) {
    if (typeof s === 'object') {
        return s.length.toString();
    }
    return Buffer.byteLength(s).toString()
}