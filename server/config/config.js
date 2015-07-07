var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');
module.exports = {
    development: {
        rootPath: rootPath,
        db: 'mongodb://localhost/training',
        port: process.env.PORT || 3030,
        staticFolder: 'public'
    },
    production: {
        rootPath: rootPath,
        db: 'mongodb://rtbyrd21:Holden21!@apollo.modulusmongo.net:27017/t4agoWom',
        port: process.env.PORT || 80,
        staticFolder: 'build'
    },
    build: {
        rootPath: rootPath,
        db: 'mongodb://localhost/training',
        port: process.env.PORT || 3030,
        staticFolder: 'build'
    }
}