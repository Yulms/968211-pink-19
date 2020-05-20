"use strict";

var gulp = require("gulp");
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

gulp.task("copy", function () {
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/**",
      "!source/img/**/*icon-*.svg",
      // "source/js/**",
      "source/*.ico",
      "source/mockups/**/*"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
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
      "source/img/**/*.{png,jpg,svg}",
      "!source/img/**/icon-*.svg"
    ])
    .pipe(imagemin([
      imagemin.mozjpeg({
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 3
      }),
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
    .pipe(gulp.dest("build/img"))
});

gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({
      quality: 80
    }))
    .pipe(gulp.dest("build/img"));
});

gulp.task("svgsprite-icons", function () {
  return gulp.src("source/img/icon-*.svg")
    .pipe(cheerio({
      run: function ($) {
        $("[fill]").removeAttr("fill");
        $("[style]").removeAttr("style");
      },
      parserOptions: {
        xmlMode: true
      }
    }))
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
          sprite: "sprite-icons.svg",
          dest: "."
        }
      }
    }))
    .pipe(gulp.dest("build/img/sprite"));
});

gulp.task("svgsprite-logo", function () {
  return gulp.src("source/img/logo-pink*.svg")
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
          sprite: "sprite-logo.svg",
          dest: "."
        }
      }
    }))
    .pipe(gulp.dest("build/img/sprite"));
});

// не используется
gulp.task("svgstore", function () {
  return gulp.src("source/img/icon-*.svg")
    .pipe(cheerio({
      run: function ($) {
        $("[fill]").removeAttr("fill");
        $("[style]").removeAttr("style");
      },
      parserOptions: {
        xmlMode: true
      }
    }))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img/sprite"));
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
  gulp.watch("source/img/icon-*.svg", gulp.series("svgsprite-icons", "refresh"));
  gulp.watch("source/img/logo-pink*.svg", gulp.series("svgsprite-logo", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/js/*.js", gulp.series("js", "refresh"));
});

gulp.task("build", gulp.series("clean", "copy", "css", "images", "webp", "svgsprite-icons", "svgsprite-logo", "html", "js"));
gulp.task("start", gulp.series("build", "server"));
