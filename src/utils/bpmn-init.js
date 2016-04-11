const fs = require('fs');
const path = require('path');

export default function init() {
    return new Promise((resolve, reject) => {
        fs.mkdir(path.resolve('.', '.bpmn'), mkdirObjects);
        function mkdirObjects(err) {
            if(!err) {
                fs.mkdir(path.resolve('.', '.bpmn', 'objects'), () => resolve());
            } else {
                reject();
            }
        }
    });

}