
var auth = require('./auth'),
    users = require('../controllers/users'),
    courses = require('../controllers/courses'),
    mongoose = require('mongoose'),
    env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

    var environment = function(x){
        return x === 'development';
    }

module.exports = function(app) {


    app.get('/api/users', auth.requiresRole('admin'), users.getUsers);
    app.post('/api/users', users.createUser);
    app.put('/api/users', users.updateUser);

    app.get('/api/courses', courses.getCourses);
    app.get('/api/courses/:id', courses.getCourseById);

    app.get('/partials/*', function (req, res) {
        console.log(req.params[0]);
        res.render('../../public/app/' + req.params[0]);
    });

    app.post('/login', auth.authenticate)

    app.post('/logout', function(req, res){
        req.logout();
        res.end();
    });

    app.all('/api/*', function(req, res){
        res.send(404);
    });

    app.get('/', function (req, res) {
        res.render('index', {
            bootstrappedUser: req.user,
            isDevelopment: environment(env)
        })

    });
}