"use strict";

var nav = document.querySelector(".header");
var navToggle = document.querySelector(".header__nav-toggle");

function menuToggle() {
  nav.classList.toggle("header--nav-opened");
  nav.classList.toggle("header--nav-closed");
}

if (nav && navToggle) {
  nav.classList.remove("header--nojs");
  menuToggle()

  navToggle.addEventListener("click", function (evt) {
    evt.preventDefault();
    menuToggle()
  });
}
