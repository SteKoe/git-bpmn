'use strict';
var OrientDB = require('orientjs');
var Bluebird = require('bluebird');

const orientConfig = {
    host: '127.0.0.1',
    port: 2424,
    username: 'root',
    password: 'root'
};
const orientDbName = 'modelrepo';

export default function orientdbService() {
    return {
        connect: connect,
        createDatabase: createDatabase,
        dropDatabase: dropDatabase
    };

    function _openServerConnection() {
        return OrientDB(orientConfig);
    }


    function connect() {
        var server = OrientDB(orientConfig);

        return new Bluebird(function (resolver) {
            return resolver(server.use({
                name: orientDbName,
                username: 'root',
                password: 'root'
            }));
        })
            .disposer(function () {
                server.close();
            });
    }

    function createDatabase(dbName) {
        var db;
        return _setupDatabase(dbName || orientDbName)
            .finally(() => {
                if(db) {
                    db.close();
                }
            });

        function _setupDatabase(dbName) {
            var createDatabase = {
                name: dbName,
                type: 'graph',
                storage: 'plocal'
            };

            var server = _openServerConnection();
            return server.create(createDatabase)
                .then(function () {
                    db = server.use({
                        name: dbName,
                        username: 'root',
                        password: 'root'
                    });
                });
        }
    }

    function dropDatabase(dbName) {
        var server = _openServerConnection();
        return server.drop(dbName || orientDbName)
            .then(message => {
                server.close();
                return message;
            });
    }
}
