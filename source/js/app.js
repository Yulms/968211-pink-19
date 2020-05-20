"use strict";

var nav = document.querySelector(".nav");
var navToggle = document.querySelector(".nav__toggle");

function menuToggle() {
  nav.classList.toggle("nav--opened");
  nav.classList.toggle("nav--closed");
}

if (nav && navToggle) {
  nav.classList.remove("nav--nojs");
  menuToggle()

  navToggle.addEventListener("click", function (evt) {
    evt.preventDefault();
    menuToggle()
  });
}
