'use strigct'

/*
	Подключаем плагины в проекте
 */

var gulp = require('gulp'),
		clear = require('del'),
		prefix = require('gulp-autoprefixer'),
		concat = require('gulp-concat'),
		csso = require('gulp-csso'),
		imgmin = require('gulp-imagemin'),
		notify = require('gulp-notify'),
		plumber = require('gulp-plumber'),
		pug = require('gulp-pug'),
		rename = require('gulp-rename'),
		soursmap = require('gulp-sourcemaps'),
		styl = require('gulp-stylus'),
		uglify = require('gulp-uglify'),
		png = require('imagemin-pngquant'),
		sync  = require('browser-sync').create(),
		reolad = sync.reolad;

/*
	Запускаем слежение за изменениями в файлах проекта и автоматическим обнавлением страницы в браузере
 */

gulp.task('server', ['cssDev', 'htmlDev', 'jsDev'], function() {
	sync.init({
		server: {
			baseDir: 'dev/files'
		}
	});	
	gulp.watch('dev/pug/**/*.pug', ['htmlDev']);
	gulp.watch([
		'dev/styles/**/*.styl',
		'dev/blocks/**/*.styl'
		],	['cssDev']);
	gulp.watch('dev/blocks/**/*.*').on('change', sync.reload);
	gulp.watch('dev/blocks/**/*.css').on('change', sync.reload);
});

/*
	Создаем магию сборки GULP
 */

gulp.task('htmlDev', function() {
	return gulp.src('dev/pug/**/*.pug')
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'Pug-Html',
					message: err.massage
				}
			})
		}))
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest('dev/files'))
		.pipe(sync.stream());
});

gulp.task('cssDev', function() {
	return gulp.src('dev/styles/styles.styl')
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'Stylus-Css',
					message: err.message
				}
			})
		}))
		.pipe(soursmap.init())
		.pipe(styl())
		.pipe(prefix())
		.pipe(gulp.dest('dev/files/css'))
		.pipe(rename({suffix: '.min'}))
		.pipe(csso())
		.pipe(gulp.dest('dev/files/css'))
		.pipe(soursmap.write())
		.pipe(sync.stream());
});

gulp.task('jsDev', function() {
	return gulp.src('dev/blocks/**/*.js')
		.pipe(plumber({
			errorHandler: notify.onError(function(err) {
				return {
					title: 'javaScript',
					message: err.message
				}
			})
		}))
		.pipe(soursmap.init())
		.pipe(concat('index.js'))
		.pipe(gulp.dest('dev/files/js/'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('dev/files/js/'))
		.pipe(soursmap.write())
		.pipe(sync.stream());
});

gulp.task('css:vendor', function() {
	return gulp.src([
		'dev/vendor/font-awesome/css/font-awesome.min.css',
		'dev/vendor/normalize.css/normalize.css'
		])
		.pipe(concat('vendor.min.css'))
		.pipe(csso())
		.pipe(gulp.dest('dev/files/css/'));
});

gulp.task('js:vendor', function() {
	return gulp.src([
		'dev/vendor/jquery/dist/jquery.min.js'
		])
		.pipe(concat('vendor.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dev/files/js/'));
});

gulp.task('fonts:vendor', function() {
	return gulp.src([
		'dev/vendor/font-awesome/fonts/*.*'
		])
	.pipe(gulp.dest('dev/files/fonts/'));
});

gulp.task('build', ['css:vendor', 'js:vendor', 'fonts:vendor']);

gulp.task('default', ['server', 'build']);

/*
	Перенос в продакшен
 */

gulp.task('clean', function() {
	return del('dist');
});

gulp.task('img', function() {
	return gulp.src('dev/files/img/**/*.*')
	.pipe(imagemin({
		use: [pngquant]
	}))
	.pipe(gulp.dest('dist/img'));
});

gulp.task('dist', function() {
	var htmlDist = gulp.src('dev/files/index.html')
		.pipe(gulp.dest('dist'));
	var cssDist = gulp.src('dev/files/css/*.css')
		.pipe(gulp.dest('dist/css'));
	var jsDist = gulp.src('dev/files/js/*.js')
		.pipe(gulp.dest('dist/js'));
	var fontsDist = gulp.src('dev/files/fonts/*.*')
		.pipe(gulp.dest('dist/fonts'));
	return htmlDist, cssDist, jsDist, fontsDist;
});

gulp.task('public', gulp.series('clean', 'img', 'dist'));