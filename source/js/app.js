"use strict";

var nav = document.querySelector(".header");
var navToggle = document.querySelector(".header__nav-toggle");

function menuToggle() {
  nav.classList.toggle("header--nav-opened");
  nav.classList.toggle("header--nav-closed");
};

if (nav && navToggle) {
  nav.classList.remove("header--nojs");
  menuToggle()

  navToggle.addEventListener("click", function (evt) {
    evt.preventDefault();
    menuToggle()
  });
};












// 0. Пишем код открытия и закрытия модальных окон
var modalWindow;
var btnClose;

// Функция открытия модальных окон
function showModal(evt, modalClass) {
  modalWindow = document.querySelector(modalClass);

  // Добавляем события закрытия на кнопку закрытия внутри этого модального окна
  btnClose = document.querySelector(modalClass + " .js--modal-close");
  btnClose.addEventListener("click", function (evt) {
    evt.preventDefault();
    modalWindow.classList.add("modal--closed");
  });

  // открываем окно
  modalWindow.classList.remove("modal--closed");
};

// закрытие окна по нажатию esc
window.addEventListener("keydown", function (evt) {
  if (evt.keyCode === 27 && modalWindow) {
    modalWindow.classList.add("modal--closed");
  };
});

// упрощенная валидация (только наличие инфы в полях)
var surnameField = document.getElementById("surname-field");
var nameField = document.getElementById("name-field");
var phoneField = document.getElementById("phone-field");
var emailField = document.getElementById("email-field");

function validateFormFields() {
  if (surnameField.value && nameField.value && phoneField.value && emailField.value) {
    return true;
  };
};

var btnForm = document.querySelector(".button--form-send");
if (btnForm) {

  btnForm.addEventListener("click", function (evt) {
    evt.preventDefault();
    // 1. Проверяем валидность введенных данных
    if (validateFormFields()) {
      // 2. Если все верно - отпускаем отправку и показываем окно подтверждения
      showModal(evt, ".modal--confirmation");
    } else {
      // 3. Если нет - модальное окно ошибки
      showModal(evt, ".modal--error");
    };
  });
};









// Отложенная загрузка карты
if (document.querySelector("#map")) {

  setTimeout(function () {
    var elem = document.createElement("script");
    elem.type = "text/javascript";
    elem.src = "https://api-maps.yandex.ru/2.1/?apikey=e46ca710-c34e-4eb0-af87-f1ae0cc4898a&lang=ru_RU";
    document.getElementsByTagName("body")[0].appendChild(elem);
  }, 3000);

  setTimeout(function () {
    ymaps.ready(function () {
      var petersburgMap = new ymaps.Map("map", {
        center: [59.936324, 30.321006],
        zoom: 15,
        // убирает лишние контролы
        controls: ["smallMapDefaultSet"]
      });

      var myPlacemark = new ymaps.Placemark(petersburgMap.getCenter(), {
        balloonContentHeader: "PINK",
        balloonContentBody: "Приложение для хорошего настроения",
        balloonContentFooter: "и не только",
        hintContent: "г. Санкт-Петербург, <br>ул. Большая Конюшенная, д.&nbsp;19/8,&nbsp;офис&nbsp;101"
      }, {
        iconLayout: "default#image",
        iconImageHref: "img/svg/icon-map-marker.svg",
        iconImageSize: [36, 35],
        iconImageOffset: [-18, -17]
      });

      petersburgMap.geoObjects.add(myPlacemark);
    });
  }, 5000);
};
