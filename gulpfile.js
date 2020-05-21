"use strict";

var gulp = require("gulp");
var gulpMerge = require("gulp-merge");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var cheerio = require("gulp-cheerio");
var svgsprite = require("gulp-svg-sprite");
var svgstore = require("gulp-svgstore");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var del = require("del");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var posthtml = require("gulp-posthtml");
var htmlmin = require("gulp-htmlmin");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var server = require("browser-sync").create();


gulp.task("clean", function () {
  return del("build");
});

gulp.task("copy-data", function () {
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/js/**",
      "source/mockups/**/*"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("copy-raster-img", function () {
  return gulp.src([
      "source/img/raster/**/*",
      "source/*.ico"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("svg-sprite", function () {
  /* В одноцветных иконках, которым надо менять цвет в css,
  необходимо удалить атрибуты fill, style и, возможно, stroke
  Иконки, которым надо менять два цвета или вообще не изменять цвета
  удаление атрибутов необходимо делать вручную при необходимости.
  После удаления автоматического удаления атрибутов потоки сливаются */
  return gulpMerge(
      gulp.src("source/img/svg/sprited/remove-attr/**/*.svg")
      .pipe(cheerio({
        run: function ($) {
          $("[fill]").removeAttr("fill");
          $("[style]").removeAttr("style");
        },
        parserOptions: {
          xmlMode: true
        }
      })),
      gulp.src("source/img/svg/sprited/as-is/**/*.svg"))
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [{
            removeViewBox: false
          },
          {
            cleanupNumericValues: {
              floatPrecision: 1
            }
          },
          {
            convertPathData: {
              floatPrecision: 1
            }
          },
          {
            cleanupListOfValues: {
              floatPrecision: 1
            }
          }
        ]
      })
    ]))
    .pipe(svgsprite({
      mode: {
        symbol: {
          sprite: "_sprite.svg",
          dest: "."
        }
      }
    }))
    .pipe(gulp.dest("build/img/svg"));
});

gulp.task("svg-background", function () {
  return gulp.src([
      "source/img/svg/others/**/*.svg"
    ])
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [{
            removeViewBox: false
          },
          {
            cleanupNumericValues: {
              floatPrecision: 1
            }
          },
          {
            convertPathData: {
              floatPrecision: 1
            }
          },
          {
            cleanupListOfValues: {
              floatPrecision: 1
            }
          }
        ]
      })
    ]))
    .pipe(gulp.dest("build/img/svg"));
});

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    // .pipe(postcss([
    //   autoprefixer()
    // ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream()); // при изменении css отправить сигнал для перезагрузки сервера
});

gulp.task("images", function () {
  return gulp.src([
      "source/img/raster/**/*.{png,jpg}"
    ], {
      base: "source"
    })
    .pipe(imagemin([
      imagemin.mozjpeg({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 3
      })
    ]))
    .pipe(gulp.dest("build"))
});

gulp.task("webp", function () {
  return gulp.src("source/img/raster/**/*.{png,jpg}")
    .pipe(webp({
      quality: 80
    }))
    .pipe(gulp.dest("build/img/raster"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    // .pipe(posthtml())
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest("build"));
});

gulp.task("js", function () {
  return gulp.src("source/js/*.js")
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(rename("all.min.js"))
    .pipe(gulp.dest("build/js"));
})

// служебная задача - перезагрузка сервера
gulp.task("refresh", function (done) {
  server.reload();
  done();
})

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch("source/img/svg/sprited/**/*.svg", gulp.series("svg-sprite", "refresh"));
  gulp.watch("source/img/svg/others/**/*.svg", gulp.series("svg-background", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/js/*.js", gulp.series("js", "refresh"));
});

gulp.task("build", gulp.series(
  "clean",
  "copy-data",
  "copy-raster-img",
  "svg-sprite",
  "svg-background",
  "css",
  "images",
  "webp",
  "html",
  "js"
));
gulp.task("start", gulp.series("build", "server"));
