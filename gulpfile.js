'use strict';

var config = require('./build/build.config.js');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var pkg = require('./package');
var del = require('del');
var proxy = require('http-proxy-middleware');
var imagemin = require('gulp-imagemin');
var gulpIgnore = require('gulp-ignore');
gulp.task('copy', function() {
    return gulp.src([
        config.base + '/**/*',
       './src/js/mpm_webp.js',
        '!' + config.base + '/*.html',
        '!' + config.images,
        '!' + config.js,
        '!' + config.mainScss,
    ]).pipe(gulp.dest(config.dist))
        .pipe($.size({
            title: 'copy'
        }));
});
gulp.task('copy:js', function() {
    //uglify 报错 异常下的 js 复制
    return gulp.src([
        './src/js/mpm_webp.js',
    ])
        .pipe(gulp.dest(config.dist + '/js'))
        .pipe($.size({
            title: 'copy:js'
        }));
});

// optimize images and put them in the dist folder
gulp.task('images', function() {
    return gulp.src(config.images)
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(config.dist + '/img'))
        .pipe($.size({
            title: 'images'
        }));
});

// optimize images and put them in the dist folder
gulp.task('uglify:js', function() {
    return gulp.src([
        config.js,
        '!./src/js/mpm_webp.js'
    ])
        .pipe($.uglify())
        // .pipe($.uglify({
        //     mangle: true,//类型：Boolean 默认：true 是否修改变量名
        //     compress: true,//类型：Boolean 默认：true 是否完全压缩
        // }))
        .pipe(gulp.dest(config.dist + '/js'))
        .pipe($.size({
            showFiles: true, gzip: true, title: 'uglify-js'
        }));
});

// optimize images and put them in the dist folder
gulp.task('uglify:mainScss', function() {
    return gulp.src([
        config.mainScss,
    ])
        .pipe($.csso())
        .pipe(gulp.dest(config.dist + '/css'))
        .pipe($.size({
            showFiles: true, gzip: true, title: 'uglify-css'
        }));
});

//build files for development
gulp.task('build', ['clean'], function(cb) {
    runSequence(['html'], cb);
});

//build files for creating a dist release
gulp.task('build:dist', ['clean'], function(cb) {
    runSequence(['html','copy', 'images', 'uglify:js', 'copy:js', 'uglify:mainScss'], cb);
});

gulp.task('html', function() {
    var assets = $.useref.assets({
        searchPath: '{build/tmp,src}'
    });
    return gulp.src(config.index)
        .pipe(assets)
        .pipe($.sourcemaps.init())
        // .pipe($.if('*.js', $.preprocess({context: { DEBUG: false }})))
        .pipe($.if('*.js', $.uglify({
            // mangle: false,
        })))
        .pipe($.if('*.css', $.csso()))
        .pipe($.if(['**/*main.js', '**/*main.css'], $.header(config.banner, {
            pkg: pkg
        })))
        .pipe($.rev())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe($.if('*.html', $.minifyHtml({
            empty: true
        })))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(config.dist))
        .pipe($.size({
            title: 'html'
        }));
});

//clean temporary directories
gulp.task('clean', del.bind(null, [config.dist, config.tmp]));


//default task
gulp.task('default', ['serve']); //


// 设置代理
var middleware = proxy('/apis/api/**', {
    target: 'http://192.168.4.111',
    changeOrigin: true,
    logLevel: 'debug'
});

//run the server after having built generated files, and watch for changes
gulp.task('serve', ['build'], function() {
    browserSync({
        port: config.port,
        ui: {
            port: config.uiPort
        },
        startPath: 'index.html',
        directory:true,
        notify: false,
        logPrefix: pkg.name,
        server: [config.tmp, 'src'],
        middleware: [middleware]
    });

    // browserSync.init({
    //     server: {
    //         baseDir: './src',
    //         port: config.uiPort,
    //         middleware: [middleware]
    //     },
    //     startPath: 'shopDecoration01.html?id=244',
    // })

    gulp.watch(config.index, reload);
    gulp.watch(config.mainScss, reload);
    gulp.watch(config.images, reload);
    gulp.watch(config.js, reload);
});

