/* eslint-env node */
const { src, dest, series, parallel, watch } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
// unit testing
const jasmine = require('gulp-jasmine');
const replace = require('gulp-replace');
 require('dotenv').config();
// live reloading
const browserSync = require('browser-sync').create();
// css optimization
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
// js optimization
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
// image optimization
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

function replaceApi(done) {
    src(['./index.html'])
        .pipe(replace('GOOGLEMAP_API_KEY', process.env.API_KEY))
        .pipe(dest('./dist'));
    done();
}

/**
 * @function watchTestFiles
 * @description watch unit testing files -- spec and src js files
 */
function watchTestFiles() {
    browserSync.init({
        server: './',
    });

    watch(['js/app.js', 'jasmine/spec/feedreader.js']).on('change', browserSync.reload);
}

/**
 * @function watchFiles
 * @description watch css, js and html files
 */
function watchFiles(done) {
    browserSync.init({
        server: './dist',
    });
    // Update the "default" Task, calling .init on browserSync starts the server.
    watch('css/**/*.css', series('styles'));
    watch('js/**/*.js', series('scripts'));
    watch('index.html', series('copyHTML'));
    watch('./dist/index.html').on('change', browserSync.reload);
    done();
}

/**
 * @function copyFont
 * @description load font files and pipe to dest folder
 */
function copyFont(done) {
    src('fonts/*').pipe(dest('./dist/fonts'));
    done();
}

/**
 * @function copyHTML
 * @description load html files and pipe to dest folder
 */
function copyHTML(done) {
    src('./index.html').pipe(dest('./dist'));
    done();
}

/**
 * @function copyImages
 * @description load images, minified it for development production and pipe to dest folder
 */
function copyImages() {
    return src('img/site_images/**/*')
        .pipe(
            imagemin({
                progressive: true,
                use: [pngquant()],
            })
        )
        .pipe(dest('./dist/img/site_images/'));
}

/**
 * @function distScripts
 * @description load js files and concat it for development and pipe to dest folder
 */
function scripts(done) {
    src(['js/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(
            babel({
                presets: ['@babel/preset-env'],
            })
        )
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream());
    done();
}

/**
 * @function distScripts
 * @description load js files, concat, minified it for production and pipe to dest folder
 */
function distScripts(done) {
    src('js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(
            babel({
                presets: ['@babel/preset-env'],
            })
        )
        .pipe(concat('app.js'))
        .pipe(terser())
        .pipe(sourcemaps.write())
        .pipe(dest('dist/js'));
    done();
}

/**
 * @function styles
 * @description load css files, add vendor prefixes for development and pipe to dest folder
 */
function styles(done) {
    let processors = [
        autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
        })
    ];
    src('css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.init())
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream()); // Update the "styles" Function
    done();
}

/**
 * @function distStyles
 * @description load css files, concat and minified it for production and pipe to dest folder
 */
function distStyles() {
    let processors = [
        autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
        }),
        cssnano
    ];
    return src('css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.init())
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream()); // Update the "styles" Function
}

/**
 * @function tests
 * @description unit testing
 */
function tests() {
    var filesForTest = ['js/app.js', 'jasmine/spec/feedreader.js'];
    return gulp
        .src(filesForTest)
        .pipe(watch(filesForTest))
        .pipe(jasmine())
}

/**
 * @function copyTests
 * @description copy unit test files and pipe to dest folder
 */

function copyTests(done) {
    src(['jasmine/**/*.js'])
        .pipe(dest('dist/jasmine'));
    done();
}

exports.styles = styles;
exports.tests = tests;
exports.copyFont = copyFont;
exports.copyTests = copyTests;
exports.copyImages = copyImages;
exports.copyHTML = copyHTML;
exports.scripts = scripts;
exports.distScripts = distScripts;
exports.distStyles = distStyles;
exports.replaceApi = replaceApi;

// For development
exports.default = series(copyFont, copyHTML, copyImages, styles, scripts, copyTests, replaceApi, watchFiles);
// for unit testing
exports.unitTest = series(watchTestFiles);
// For production
exports.dist = series(copyFont, copyHTML, copyImages, distStyles, copyTests, distScripts);
