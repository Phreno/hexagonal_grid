var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var pipeline = require('readable-stream').pipeline;

var browserify = require('gulp-browserify');
// Basic usage
gulp.task('scripts', function () {
  // Single entry point to browserify
  gulp.src('build/hexaction.js')
    .pipe(browserify({
      insertGlobals: true,
    }))
    .pipe(gulp.dest('./dist/js'))
});