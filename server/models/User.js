var mongoose = require('mongoose'),
    encrypt = require('../utilities/encryption');


var userSchema = mongoose.Schema({
    firstName: {type:String, required:'{PATH} is required'},
    lastName: {type:String, required:'{PATH} is required'},
    userName: {
        type:String,
        required:'{PATH} is required',
        unique:true
    },
    salt: {type:String, required:'{PATH} is required'},
    hashed_pwd: {type:String, required:'{PATH} is required'},
    roles: [String]
});

userSchema.methods = {
    authenticate: function(passwordToMatch){
        return encrypt.hashPwd(this.salt, passwordToMatch) === this.hashed_pwd;
    },
    hasRole: function (role) {
        return this.role.indexOf(role) > -1;
    }
}

var User = mongoose.model('User', userSchema);

function createDefaultUsers() {
    User.find({}).exec(function (err, collection) {
        if (collection.length === 0) {
            var salt, hash;
            salt = encrypt.createSalt();
            hash = encrypt.hashPwd(salt, 'rob');
            User.create({
                firstName: 'Rob', lastName: 'Byrd', userName: 'rtbyrd21',
                salt: salt, hashed_pwd: hash, roles: ['admin']
            });
            hash = encrypt.hashPwd(salt, 'holden');
            User.create({
                firstName: 'Holden', lastName: 'Byrd', userName: 'hjbyrd21',
                salt: salt, hashed_pwd: hash, roles: []
            });
            hash = encrypt.hashPwd(salt, 'ken');
            User.create({firstName: 'Ken', lastName: 'Byrd', userName: 'kgbyrd21', salt: salt, hashed_pwd: hash});
        }
    })
};

exports.createDefaultUsers = createDefaultUsers;