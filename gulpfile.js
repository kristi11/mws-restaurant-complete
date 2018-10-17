var gulp = require('gulp');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');
let uglify = require('gulp-uglify-es').default;

gulp.task('default', function() {
  // place code for your default task here
});

// minify css and place files in css-min folder
gulp.task('styles', function () {
  return gulp.src('css/styles.css')
    // Auto-prefix css styles for cross browser compatibility
    .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
    // Minify the file
    .pipe(csso())
    // Output
    .pipe(gulp.dest('./css-min'))
});

//minify javascript and place the files in js-min folder
gulp.task('scripts', function() {
  gulp.src('js/**/*.js')
	.pipe(uglify())
	.pipe(gulp.dest('./js-min/'));
});