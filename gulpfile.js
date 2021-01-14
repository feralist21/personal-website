"use strict";

const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const sourcemap = require("gulp-sourcemaps");
const autoprefixer = require("autoprefixer");
const cssnano = require("gulp-cssnano");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const del = require("del");
const rigger = require('gulp-rigger');
const uglify = require('gulp-uglify');
const sync = require("browser-sync").create();

const browsersync = (done) => {
  sync.init({
    server: {
      baseDir: "./build/"
    },
    port: 3000
  });
};

const browserSyncReload = (done) => {
  sync.reload();
};

// Fonts
const fonts = () => {
  return gulp.src("source/fonts/*.{woff,woff2}")
  .pipe(gulp.dest("build/fonts/"));
};

// Html
const html = () => {
  return gulp.src("source/*.html")
  .pipe(plumber())
  .pipe(gulp.dest("build/"))
  .pipe(sync.stream());
};

// Style
const style = () => {
  return gulp.src("source/sass/style.scss")
  .pipe(plumber())
  .pipe(sourcemap.init())
  .pipe(sass())
  .pipe(postcss([autoprefixer()]))
  .pipe(cssnano({
    discardComments: {
      removeAll: true
    }
  }))
  .pipe(rename("style.min.css"))
  .pipe(sourcemap.write("."))
  .pipe(gulp.dest("build/css/"))
  .pipe(sync.stream());
};

const js = () => {
  return gulp.src("source/js/*.js")
  .pipe(plumber())
  .pipe(rigger())
  .pipe(gulp.dest("build/js/"))
  .pipe(uglify())
  .pipe(rename("app.min.js"))
  .pipe(gulp.dest("build/js/"))
  .pipe(sync.stream());
};

// Images
const images = () => {
  return gulp.src("source/img/**/*.{jpg,svg,png}")
  .pipe(imagemin([
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
  		plugins: [
  			{removeViewBox: true},
  			{cleanupIDs: false}
  		]
	})
  ]))
  .pipe(gulp.dest("build/img/"))
  .pipe(sync.stream());
};

// Clean directory
const clean = () => {
  return del("./build");
};

// Watcher
const watcher = () => {
  gulp.watch("source/*.html", html);
  gulp.watch("source/sass/**/*.scss", style);
  gulp.watch("source/img/**/*.{jpg,svg,png}", images);
};

const build = gulp.series(clean, gulp.parallel(html, style, js, images, fonts));
const watch = gulp.parallel(build, watcher, browsersync);

// Export tasks
exports.html = html;
exports.fonts = fonts;
exports.style = style;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
