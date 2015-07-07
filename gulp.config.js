
module.exports = function(){
  var client = './public/';
  var clientApp = client + 'app/';
  var server = './server/';
  var temp = client + 'tmp/';
  var tempClean = client + 'tmp/';
  var build = './build/';
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
      assetDirectory: build + 'app/layout.html',
      build: build,
      client: client,
      fonts: client + 'vendor/components-font-awesome/fonts/**/*.*',
      images: client + 'images/**/*.*',
      html: '**/*.html',
      tempClean: tempClean,
      htmltemplates: build + '**/*.html',
      jade: clientApp + '**/*.jade',
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
       * templateCache
       */
      templateCache: {
          file: 'templates.js',
          options: {
              module: 'app',
              standAlone: false,
              root: 'partials/',
              transformUrl: function(url) {
                  return url.replace('.html', '').replace('/app', '')
              }
          }
      },

      /*
       * Browser sync
       */

      browserReloadDelay: 1000,

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