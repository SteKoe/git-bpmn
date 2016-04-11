const path = require('path');
const fs = require('fs');
const Bluebird = require('bluebird');
const glob = require('glob-promise');
const BPMN_FOLDER = path.resolve('.', '.bpmn');
const BPMN_OBJECTS_FOLDER = path.resolve(BPMN_FOLDER, 'objects');

import Hash from '../utils/git-hash';
import GitObject from '../utils/git-object';

export default class DiagramFileRepository {
    static findById(id) {
        let parsedDiagram;

        return DiagramFileRepository._loadObject(id)
            .then(gitObject => {
                parsedDiagram = gitObject.content;
                return Bluebird.all(gitObject.content.diagramObjectIds.map(id => DiagramFileRepository._loadObject(id)))
            })
            .then(result => {
                parsedDiagram.diagramObjects = result.map(r => r.content);
                let modelObjectIds = parsedDiagram.diagramObjects.map(r => r.modelObjectId);
                return Bluebird.all(modelObjectIds.map(id => DiagramFileRepository._loadObject(id)))
            })
            .then(modelObjects => {
                parsedDiagram.diagramObjects.forEach(diagramObject => {
                    diagramObject.modelObject = modelObjects.find(mo => mo.content.id === diagramObject.modelObjectId).content;
                    delete diagramObject.modelObjectId;
                });
                delete parsedDiagram.diagramObjectIds;
            })
            .then(() => parsedDiagram);
    }


    static _loadObject(id) {
        return glob(BPMN_OBJECTS_FOLDER + '/*')
            .then(res => {
                var object = res.find(res => new RegExp(`${id}$`).test(res));
                return fs.readFileSync(object, 'utf8');
            })
            .then(object => {
                const [header, content] = object.split(new Buffer('\0'));
                const [type, size] = header.split(' ');

                return {
                    type: type,
                    size: size,
                    content: JSON.parse(content)
                }
            });
    }

    static save(diagram) {
        diagram = JSON.parse(JSON.stringify(diagram));
        var entities = [];
        var diagramObjects = [];

        diagram.diagramObjectIds = [];
        diagram.diagramObjects.forEach(diagramObject => {
            let entity = diagramObject.modelObject;
            var entityHash = Hash.entity(JSON.stringify({
                attributes: entity.attributes
            }));
            entity.id = entityHash;
            diagramObject.modelObjectId = entity.id;
            entities.push(entity);

            let diagramObjectHash = Hash.node(JSON.stringify({
                name: diagramObject.name,
                modelObjectId: diagramObject.modelObjectId
            }));
            diagramObject.id = diagramObjectHash;
            delete diagramObject.modelObject;
            diagramObjects.push(diagramObject);
            diagram.diagramObjectIds.push(diagramObject.id);
        });

        let diagramHash = Hash.diagram(JSON.stringify({
            name: diagram.name,
            diagramObject: diagram.diagramObjects.map(n => n.id)
        }));
        diagram.id = diagramHash;
        delete diagram.diagramObjects;

        let result = [diagram].concat(diagramObjects);
        result = result.concat(entities);

        var promises = result.map(r => {
            return new Promise((resolve, reject) => {
                let content = GitObject[r.type](JSON.stringify(r));
                fs.writeFile(path.resolve(BPMN_OBJECTS_FOLDER, r.id), content, 'utf8', (err) => {
                    if(err) reject(err);
                    resolve();
                });
            });
        });

        return Bluebird.all(promises)
            .then(() => result);
    }
}