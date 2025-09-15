"use strict";

var express = require("express");
var cors = require("cors");
var _require = require("./config/cors.js"),
  corsOptions = _require.corsOptions;
var _require2 = require("./config/mongodb.js"),
  CONNECT_DB = _require2.CONNECT_DB;
var APIs_v1 = require("./routes/v1");
var errorHandlingMiddleware = require("./middlewares/errorHandlingMiddleware.js");
var cookieParser = require("cookie-parser");
var env = require("./config/environment.js");
var START_SERVER = function START_SERVER() {
  var app = express();
  // Fix cái vụ Cache from disk của ExpressJS
  // https://stackoverflow.com/a/53240717/8324172
  app.use(function (req, res, next) {
    res.set("Cache-Control", "no-store");
    next();
  });

  // Cấu hình cookie parser
  app.use(cookieParser());

  // Xu ly CORS
  app.use(cors(corsOptions));

  // Enable req.body json data
  app.use(express.json());

  //Use API v1
  app.use("/v1", APIs_v1);

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware);
  var port = env.PORT;
  app.listen(port, function () {
    console.log("Hello Truong Nguyen, I'm running server at http://localhost:".concat(port));
  });
};

// Chỉ khi kết nối DB thành công thì mới start server
CONNECT_DB().then(function () {
  console.log("Connected to MongoDB");
}).then(function () {
  return START_SERVER();
})["catch"](function (err) {
  console.error(err);
  process.exit(0);
});