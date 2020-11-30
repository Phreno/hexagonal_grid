var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var pipeline = require('readable-stream').pipeline;

var browserify = require("gulp-browserify");
var tsify = require("tsify");

// TODO