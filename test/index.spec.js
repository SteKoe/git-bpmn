'use strict';
const fs = require('fs');
const rmdir = require('rimraf');
const path = require('path');
const chai = require('chai');
const should = chai.should();

const testData = require('./testdata.json');
const testDataUntouched = require('./testdata.untouched.json');

import BpmnInit from '../src/utils/bpmn-init';
import DiagramRepository from '../src/repositories/diagram.repository';

describe('ModelRepository', () => {
    before(done => {
        BpmnInit()
            .then(() => done())
            .catch(done);
    });

    after(done => {
        rmdir(path.resolve('.', '.bpmn'), () => done());
    });

    it('should retrieve saved diagram', (done) => {
        DiagramRepository.save(testData.diagrams[0])
            .then(result => {
                // We can rely on the fact, that the diagram is always returned at 0th position.
                return DiagramRepository.findById(result[0].id);
            })
            .then(result => {
                result.should.eql(testDataUntouched);
                done();
            })
            .catch(done);
    });

    it('should save entire diagram', (done) => {
        var diagram = DiagramRepository.save(testData.diagrams[0])
            .then(result => {
                const expected = [
                    {
                        "id": "170907b07ad69c22edb8e4f4016a940bd0ce3a0f",
                        "type": "diagram",
                        "name": "Diagram",
                        "diagramObjectIds": ["a9085ae278f96db6dbd5099231f795a0e7e37a60", "fc1884a40978ffe4257aa4a8f77882e0192c1b0e", "610b8a4247b729fe1087e63d6ad55cd8b0ff7c10"]
                    },
                    {
                        "id": "a9085ae278f96db6dbd5099231f795a0e7e37a60",
                        "type": "node",
                        "name": "Node A",
                        "modelObjectId": "56a569c5ef3131c6ff79e6c00875b8857468e1f0"
                    },
                    {
                        "id": "fc1884a40978ffe4257aa4a8f77882e0192c1b0e",
                        "type": "node",
                        "name": "Node B",
                        "modelObjectId": "56a569c5ef3131c6ff79e6c00875b8857468e1f0"
                    },
                    {
                        "id": "610b8a4247b729fe1087e63d6ad55cd8b0ff7c10",
                        "type": "node",
                        "name": "Node C",
                        "modelObjectId": "187128aacc8eae9aa21da0e1217409b0ab263d38"
                    },

                    {
                        "attributes": {
                            "name": "Entity A"
                        },
                        "id": "56a569c5ef3131c6ff79e6c00875b8857468e1f0",
                        "type": "entity"
                    },
                    {
                        "attributes": {
                            "name": "Entity A"
                        },
                        "id": "56a569c5ef3131c6ff79e6c00875b8857468e1f0",
                        "type": "entity"
                    },
                    {
                        "attributes": {
                            "name": "Entity C"
                        },
                        "id": "187128aacc8eae9aa21da0e1217409b0ab263d38",
                        "type": "entity"
                    }
                ];
                expected.should.eql(result);
                done();
            })
            .catch(done);
    });
});