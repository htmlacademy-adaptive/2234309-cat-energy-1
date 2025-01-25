import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import {deleteAsync} from 'del';

// Styles

const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// Scripts

const scripts = () => {
  return gulp.src('source/js/*.js', { sourcemaps: true })
    .pipe(terser())
    .pipe(gulp.dest('build/js', { sourcemaps: '.' }));
}

// HTML

const html = () => {
  return gulp.src('source/*.html', { sourcemaps: true })
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

// Images

const images = () => {
  return gulp.src('source/img/**/*.{png,jpg,}', { base: 'source' })
    .pipe(squoosh())
    .pipe(gulp.dest('build'));
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg,}', { base: 'source' })
    .pipe(gulp.dest('build'));
}


// SVG

const svg = () => {
  return gulp.src('source/img/**/*.svg', { base: 'source' })
    .pipe(svgo())
    .pipe(gulp.dest('build'));
}


//Copy

const copy = (done) => {
  gulp.src([
    'source/fonts/**/*.{woff,woff2}',
    'source/*.ico',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

//Clean

const clean = () => {
  return deleteAsync('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}


//Build

export const build = gulp.series(
  clean,
  copy,
  images,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg
  ));

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg
  ),
  gulp.series(
    server,
    watcher
  ));
