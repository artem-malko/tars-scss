'use strict';

var gulp = tars.packages.gulp;
var gutil = tars.packages.gutil;
var concat = tars.packages.concat;
var sass = tars.packages.sass;
var autoprefixer = tars.packages.autoprefixer;
tars.packages.promisePolyfill.polyfill();
var postcss = tars.packages.postcss;
var replace = tars.packages.replace;
var notify = tars.packages.notify;
var notifier = tars.helpers.notifier;
var browserSync = tars.packages.browserSync;

var patterns = [];
var scssFolderPath = './markup/' + tars.config.fs.staticFolderName + '/scss';
var scssFilesToConcatinate = [
        scssFolderPath + '/normalize.scss',
        scssFolderPath + '/libraries/**/*.scss',
        scssFolderPath + '/libraries/**/*.css',
        scssFolderPath + '/mixins.scss',
        scssFolderPath + '/sprites-scss/sprite_96.scss'
    ];
var processors = [
    autoprefixer({browsers: ['ie 8']})
];

if (tars.config.postprocessors && tars.config.postprocessors.length) {
    processors.push(tars.config.postprocessors);
}

if (tars.config.useSVG) {
    scssFilesToConcatinate.push(
        scssFolderPath + '/sprites-scss/svg-fallback-sprite.scss'
    );
}

scssFilesToConcatinate.push(
    scssFolderPath + '/sprites-scss/sprite-ie.scss',
    scssFolderPath + '/fonts.scss',
    scssFolderPath + '/vars.scss',
    scssFolderPath + '/GUI.scss',
    scssFolderPath + '/common.scss',
    scssFolderPath + '/plugins/**/*.scss',
    scssFolderPath + '/plugins/**/*.css',
    './markup/modules/*/*.scss',
    './markup/modules/*/ie/ie8.scss',
    scssFolderPath + '/etc/**/*.scss'
);

patterns.push(
    {
        match: '%=staticPrefixForCss=%',
        replacement: tars.config.staticPrefixForCss()
    }
);

/**
 * Scss compilation for ie8
 */
module.exports = function () {
    return gulp.task('css:compile-css-for-ie8', function (cb) {
        if (tars.flags.ie8) {
            return gulp.src(scssFilesToConcatinate)
                .pipe(concat('main_ie8' + tars.options.build.hash + '.css'))
                .pipe(replace({
                    patterns: patterns,
                    usePrefix: false
                }))
                .pipe(sass({
                    errLogToConsole: false,
                    outputStyle: 'expanded',
                    indentWidth: 4,
                    onError: function (error) {
                        notify().write('\nAn error occurred while compiling css for ie8.\nLook in the console for details.\n');
                        return gutil.log(gutil.colors.red(error.message + ' on line ' + error.line + ' in ' + error.file));
                    }
                }))
                .pipe(postcss(processors))
                .on('error', notify.onError(function (error) {
                    return '\nAn error occurred while postprocessing css.\nLook in the console for details.\n' + error;
                }))
                .pipe(gulp.dest('./dev/' + tars.config.fs.staticFolderName + '/css/'))
                .pipe(browserSync.reload({ stream: true }))
                .pipe(
                    notifier('Css-files for ie8 have been compiled')
                );
        } else {
            gutil.log('!Stylies for ie8 are not used!');
            cb(null);
        }
    });
};
