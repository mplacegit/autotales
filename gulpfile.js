
var gulp = require('gulp');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
gulp.task('default', function() {
    gulp.src('src/*.js')
   .pipe(browserify())
   .pipe(minify())
   .pipe(gulp.dest('build'));
 });
