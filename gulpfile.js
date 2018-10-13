const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
var reload = browserSync.reload;

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

gulp.task('default', ['browser-sync'], function() { 
  gulp.watch('src/assets/sass/*.scss', ['styles']);
  gulp.watch('src/**/*.js', reload);
  gulp.watch('src/**/*.html', reload);
});