const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var plumber = require('gulp-plumber');

gulp.task("browser-sync", ['styles'], function() {

  browserSync.init({
    server: "./"
  });
});

gulp.task("styles", function() {
  gulp
    .src('src/assets/sass/*.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"]
      })
    )
    .pipe(gulp.dest('src/assets/css'))
    .pipe(browserSync.stream());
});


// Concatenation
gulp.task('concat', function() {
  /* Concat in the correct order since main module, then other modules need to
   * load first
   */
  return gulp.src(['src/app/app.module.js', 'src/app/**/*.module.js',
                  'src/app/core/*.js', 'src/app/**/*.js'])
    .pipe(plumber())
    .pipe(concat('app.js', {newLine: ';'}))
    .pipe(ngAnnotate({add: true}))
    .pipe(plumber.stop())
    .pipe(gulp.dest('src/minified/'));
});

// Minification
var uglify = require('gulp-uglify');
var bytediff = require('gulp-bytediff');
var rename = require('gulp-rename');

gulp.task('prod', ['concat'], function() {
  return gulp.src('src/minified/app.js')
    .pipe(plumber())
    .pipe(bytediff.start())
    .pipe(uglify({mangle: true}))
    .pipe(bytediff.stop())
    .pipe(rename('app.min.js'))
    .pipe(plumber.stop())
    .pipe(gulp.dest('src/minified/'));
});

gulp.task('default', ['browser-sync', 'prod'], function() { 
  gulp.watch('src/assets/sass/*.scss', ['styles']);
  gulp.watch('src/**/*.js', reload);
  gulp.watch('src/**/*.html', reload);
  return gulp.watch('src/app/**/*.js', ['prod']);
});
