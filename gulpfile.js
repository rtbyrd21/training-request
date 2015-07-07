
var gulp = require('gulp'),
    args = require('yargs').argv,
    browserSync = require('browser-sync');
    config = require('./gulp.config')(),
    del = require('del'),
    path = require('path'),
    _ = require('lodash'),
    $ = require('gulp-load-plugins')({lazy:true}),
    runSequence = require('run-sequence'),
    port = process.env.PORT || config.defaultPort;

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);




gulp.task('serve-build', ['build'], function(){
    serve(false);
})

gulp.task('build-notifier', function(){
    var msg = {
        title: 'gulp build',
        subtitle: 'Deployed to the build folder',
        message: 'Completed build-process'
    }
    log(msg);
    notify(msg);
});

gulp.task('serve-dev', ['inject'], function() {
    serve(true);
});

gulp.task('vet', function(){
        log('Analyzing source with JSHint and JSCS')
        return gulp
            .src(config.alljs)
            .pipe($.if(args.verbose, $.print()))
            .pipe($.jscs())
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish', {verbose:true}))
            .pipe(jshint.reporter('fail'));
});

gulp.task('styles', ['clean-styles'], function(){
    log('Compiling Sass to CSS');
    return gulp
        .src(config.sass)
        .pipe($.plumber())
        //.pipe($.sass())
        .pipe($.compass({
            css: 'public/tmp',
            sass: 'public/styles'
            //require: ['susy', 'breakpoint']
        }))
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.temp));
});


gulp.task('fonts', ['clean-fonts'], function(){
    log('Copying fonts');
    return gulp.src(config.fonts)
        .pipe(gulp.dest(config.build + 'fonts'));
});

gulp.task('images', ['clean-images'], function(){
    log('Copying and compressing the images');
    return gulp.src(config.images)
        .pipe($.imagemin({optimization: 4}))
        .pipe(gulp.dest(config.build + 'images'));
});

gulp.task('clean', function(done){
    var delconfig = [].concat(config.build, config.tempClean);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig, done);
});

gulp.task('clean-fonts', function(done){
    clean(config.build + 'fonts/**/*.*', done);
});

gulp.task('clean-images', function(done){
    clean(config.build + 'images/**/*.*', done);
});

gulp.task('clean-styles', function(done){
    clean(config.tempClean + '**/*.css', done);
});

gulp.task('clean-code', function(done){
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + '**/*.html',
        config.build + 'js/**/*.js'
    );

    clean(files, done);
});

gulp.task('clean-build', function(done){
    var files = [].concat(
        config.build + 'app/' + '**/*',
        config.build + '*.html'
    );

    clean(files, done);
});

gulp.task('sass-watcher', function(){
    gulp.watch([config.sass], ['styles']);
});

gulp.task('templates', function(done) {

    return gulp.src(config.jade)
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest(config.build + '/app'))
});




gulp.task('templatecache', ['templates'], function(){
    log('Creating AngularJS $templatecache');

    return gulp
        .src(config.htmltemplates)
        .pipe($.minifyHtml({empty:true}))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));

});

gulp.task('wiredep', function(){
    log('wire up the bower css and js and our app js into the html');
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;
    var source = config.js;
    var sources = gulp.src(source, {read: false });

    return gulp
        .src(config.layout)
        .pipe($.using())
        .pipe(wiredep(options))
        .pipe($.inject(sources,{ignorePath: 'public'}))
        .pipe(gulp.dest(config.includes))
});


gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function(){
    log('wire up the bower css and js and our app js into the html');

    var source = config.css;
    var sources = gulp.src(source, {read: false });

    return gulp
        .src(config.layout)
        .pipe($.using())
        .pipe($.inject(sources,{ignorePath: 'public'}))
        .pipe(gulp.dest(config.includes))
});




//1

gulp.task('optimize', ['inject', 'templates'], function(done){
    log('Optimizing the javascript, css, html');
    var templateCache = config.temp + config.templateCache.file;

    return gulp
        .src(config.layout)
        .pipe($.plumber())
        .pipe($.inject(gulp.src(templateCache, {read:false}), {
            starttag: '//- inject:templates',
            ignorePath: 'public'
        }))

        .pipe(gulp.dest(config.build + 'app/'));
})

//2 //.tmp folder causing issues

gulp.task('get-asset-directory', function() {

    return gulp.src(config.build + '/app/layout.jade')
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest(config.build + '/app'))
});

//3

gulp.task('build-assets-production',  function(){
    log('Pulling in files based on script tags');
    var assets = $.useref.assets({searchPath: './public'});
    var cssFilter = $.filter('**/*.css');
    var jsLibFilter = $.filter('**/' +  config.optimized.lib + '.js');
    var jsAppFilter = $.filter('**/' +  config.optimized.app + '.js');

    return gulp
        .src(config.assetDirectory)
        .pipe(assets)
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(jsLibFilter)
        .pipe($.uglify())
        .pipe(jsLibFilter.restore())
        .pipe(jsAppFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(jsAppFilter.restore())
        .pipe($.rev())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(gulp.dest(config.build))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(config.build));
});

//4

gulp.task('set-back-to-jade', function(){
    gulp.src(config.build + 'layout.html')
        .pipe($.html2jade())
        .pipe(gulp.dest(config.build + '/app'));
});


gulp.task('build', function(callback) {
    runSequence('clean',
        'optimize', 'get-asset-directory',
        'build-assets-production', 'set-back-to-jade', 'clean-build', 'build-notifier',
        callback);
});


gulp.task('bump', function(){
   var msg = 'Bumping versions';
   var type = args.type;
   var version = args.version;
   var options = {};
   if(version){
        options.version = version;
        msg += ' to ' + version;
   }else{
       options.type = type;
       msg += ' for a ' + type;
   }
   log(msg);
   return gulp
       .src(config.packages)
       .pipe($.print())
       .pipe($.bump(options))
       .pipe(gulp.dest(config.root));

});


///////////////

function serve(isDev){

    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'development' : 'build'
        },
        watch: [config.server]
    };

    return $.nodemon(nodeOptions)
        .on('restart', function(ev) {
            log('*** nodemon restarted');
            log('files changed on restart:\n' + ev);
            setTimeout(function(){
                browserSync.notify('reloading now....');
                browserSync.reload({stream:false});
            }, config.browserReloadDelay)
        })
        .on('start', function() {
            log('*** nodemon started');
            startBrowserSync(isDev);
        })
        .on('crash', function() {
            log('*** nodemon crashed: script crashed for some reason');
        })
        .on('exit', function() {
            log('*** nodemon exited cleanly');
        });
}


function changeEvent(event){
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function startBrowserSync(isDev){
    if(args.nosync || browserSync.active){
        return;
    }
    log('Starting browser sync on port '  + port);

    if(isDev){
        gulp.watch([config.sass], ['styles'])
            .on('change', function (event) {
                changeEvent(event);
            });
    }else{
        gulp.watch([config.sass, config.js, config.jade], ['optimize', browserSync.reload])
            .on('change', function (event) {
                changeEvent(event);
            });
    }



    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.client + '**/*.*',
            '!' + config.sass,
            config.temp + '**/*.css'
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 0
    }

    browserSync(options);
}

function clean(path, done){
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done);
}

function log(msg){
    if(typeof(msg) === 'object'){
        for(var item in msg){
            if(msg.hasOwnProperty(item)){
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    }  else{
        $.util.log($.util.colors.blue(msg));
    }
}

function notify(options){
    var notifier = require('node-notifier');
    var notifyOptions = {
        sound: 'Bottle',
        contentImage: path.join(__dirname, 'gulp.png'),
        icon: path.join(__dirname, 'gulp.png')
    };
    _.assign(notifyOptions, options);
    notifier.notify(notifyOptions);
}