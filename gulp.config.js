
module.exports = function(){
  var client = './public/';
  var clientApp = client + 'app/';
  var server = './server/';
  var temp = './.tmp/';
  var config = {


      /*
      *File Paths
      */

      //all js to vet
      alljs: [
          './public/app/**/*.js',
          './server/**/*.js',
          './*.js'
      ],
      client: client,
      layout: server + 'includes/layout.jade',
      includes: server + 'includes/',
      css: temp + 'styles.css',
      js: [
            clientApp + 'app.js',
            clientApp + '**/*.js'
      ],
      sass: client + 'styles/styles.scss',
      server: ['./server/', 'server.js'],

    temp: temp,
      /*
       * Bower and NPM locations
       */

      bower: {
          json: require('./bower.json'),
          directory: client + '/vendor/',
          ignorePath: '../../public'
      },

      /*
       * Node settings
       */
       defaultPort: 3030,
       nodeServer: './server.js'

  };

  config.getWiredepDefaultOptions = function(){
      var options = {
          bowerJson: config.bower.json,
          directory: config.bower.directory,
          ignorePath: config.bower.ignorePath
      };
      return options;
  };

  return config;
};