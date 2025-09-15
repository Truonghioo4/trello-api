"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _express = _interopRequireDefault(require("express"));
var _mongodb = require("./config/mongodb.js");
require("dotenv/config.js");
var START_SERVER = function START_SERVER() {
  var app = (0, _express["default"])();
  var port = process.env.PORT;
  app.get("/", function (req, res) {
    res.send("Hello");
  });
  app.listen(port, function () {
    console.log("Hello Truong Nguyen, I'm running server at http://localhost:".concat(port));
  });
};
(0, _mongodb.CONNECT_DB)().then(function () {
  console.log("Connected to MongoDB");
}).then(function () {
  return START_SERVER();
})["catch"](function (err) {
  console.error(err);
  process.exit(0);
});