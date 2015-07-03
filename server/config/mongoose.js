var mongoose = require('mongoose'),
    crypto = require('crypto');

module.exports = function(config){
    mongoose.connect(config.db);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error....'));
    db.once('open', function callback(){
        console.log('training db opened');
    });
    //
    var userSchema = mongoose.Schema({
        firstName: String,
        lastName: String,
        userName: String,
        salt: String,
        hashed_pwd: String,
        roles: [String]
    });

    userSchema.methods = {
        authenticate: function(passwordToMatch){
            return hashPwd(this.salt, passwordToMatch) === this.hashed_pwd;
        }
    }

    var User = mongoose.model('User', userSchema);

    User.find({}).exec(function(err, collection){
      if(collection.length === 0) {
          var salt, hash;
          salt = createSalt();
          hash = hashPwd(salt, 'rob');
          User.create({firstName:'Rob', lastName:'Byrd', userName:'rtbyrd21',
              salt:salt, hashed_pwd:hash, roles:['admin']});
          hash = hashPwd(salt, 'holden');
          User.create({firstName:'Holden', lastName:'Byrd', userName:'hjbyrd21',
              salt:salt, hashed_pwd:hash, roles:[] });
          hash = hashPwd(salt, 'ken');
          User.create({firstName:'Ken', lastName:'Byrd', userName:'kgbyrd21', salt:salt, hashed_pwd:hash});
      }
    })
}

function createSalt(){
    return crypto.randomBytes(128).toString('base64');
}

function hashPwd(salt, pwd){
    var hmac = crypto.createHmac('sha1', salt);
    return hmac.update(pwd).digest('hex');
}