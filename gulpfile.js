
var gulp = require('gulp'),
    args = require('yargs').argv,
    config = require('./gulp.config')(),
    del = require('del'),
    $ = require('gulp-load-plugins')({lazy:true}),
    port = process.env.PORT || config.defaultPort;



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
        .pipe($.sass())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.temp));
});

gulp.task('clean-styles', function(done){
    var files = config.temp + '**/*.css';
    clean(files, done);
});

gulp.task('sass-watcher', function(){
    gulp.watch([config.sass], ['styles']);
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

gulp.task('inject', ['wiredep', 'styles'], function(){
    log('wire up the bower css and js and our app js into the html');

    var source = config.css;
    var sources = gulp.src(source, {read: false });

    return gulp
        .src(config.layout)
        .pipe($.using())
        .pipe($.inject(sources,{ignorePath: 'public'}))
        .pipe(gulp.dest(config.includes))
});

gulp.task('serve-dev', ['inject'], function() {
    var isDev = true;

    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server]
};

return $.nodemon(nodeOptions)
    .on('restart', function(ev) {
        log('*** nodemon restarted');
        log('files changed on restart:\n' + ev);
    })
    .on('start', function() {
        log('*** nodemon started');
    })
    .on('crash', function() {
        log('*** nodemon crashed: script crashed for some reason');
    })
    .on('exit', function() {
        log('*** nodemon exited cleanly');
    });

});



///////////////



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