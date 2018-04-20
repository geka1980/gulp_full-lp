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
		sync  = require('browser-sync').create();

/*
	Запускаем слежение за изменениями в файлах проекта и автоматическим обнавлением страницы в браузере
 */

gulp.task('server', ['css:dev', 'html:dev', 'js:dev'], function() {
	sync.init({
		server: {
			baseDir: 'dev/files/'
		}
	});	
	gulp.watch('dev/pug/**/*.pug', ['html:dev']);
	gulp.watch([
		'dev/styles/**/*.styl',
		'dev/blocks/**/*.styl'
		],	['css:dev']);
	gulp.watch('dev/blocks/**/*.*').on('change', sync.reload);
	gulp.watch('dev/blocks/**/*.css').on('change', sync.reload);
});

gulp.task('html:dev', function() {
	return gulp.src('dev/pug/index.pug')
		.pipe(plumber())
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest('dev/files'))
		.pipe(sync.stream());
});

gulp.task('css:dev', function() {
	return gulp.src('dev/styles/styles.styl')
		.pipe(plumber())
		.pipe(soursmap.init({largeFile: true}))
			.pipe(styl())
			.pipe(prefix())
			.pipe(rename({suffix: '.min'}))
			.pipe(csso())
		.pipe(soursmap.write())
		.pipe(gulp.dest('dev/files/css'))
		.pipe(sync.stream());
});

gulp.task('js:dev', function() {
	return gulp.src('dev/blocks/**/*.js')
		.pipe(plumber())
		.pipe(soursmap.init())
			.pipe(concat('index.js'))
			.pipe(gulp.dest('dev/files/js/'))
			.pipe(rename({suffix: '.min'}))
			.pipe(uglify())
		.pipe(soursmap.write())
		.pipe(gulp.dest('dev/files/js/'))
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

gulp.task('clean:build', function() {
	return del('dist');
});

gulp.task('img:build', function() {
	return gulp.src('dev/files/img/**/*.*')
	.pipe(imagemin({
		use: [pngquant]
	}))
	.pipe(gulp.dest('dist/img'));
});

gulp.task('dist:build', function() {
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

gulp.task('public', ['clean:build', 'img:build', 'dist:build']);