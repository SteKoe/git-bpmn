'use strict';
const chai = require('chai');

import GitObject from '../../src/utils/git-object'
import GitHash from '../../src/utils/git-hash'

describe('GitObject', () => {
    it('should hash node', () => {
        const node = JSON.stringify({"name":"aNode"});
        const result = GitObject.node(node).toString();
        
        result.should.eql(`node 16\0${node}`)
    });

    it('should hash entity', () => {
        const entity = JSON.stringify({"name":"aEntity"});
        const result = GitObject.entity(entity).toString();

        result.should.eql(`entity 18\0${entity}`)
    });

    it('should hash tree', () => {
        const diagram = {"type": "diagram", "name":"aDiagram"};
        const diagramHash = GitHash.diagram(JSON.stringify(diagram));
        const result = GitObject.tree([diagram]).toString();

        result.should.eql(`000000 diagram ${diagramHash}\taDiagram`);
    });
});