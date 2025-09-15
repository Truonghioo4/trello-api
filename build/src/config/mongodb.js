"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GET_DB = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
// ta không dùng mongoose
var env = require("./environment");
var _require = require("mongodb"),
  MongoClient = _require.MongoClient,
  ServerApiVersion = _require.ServerApiVersion;
var MONGODB_URL = env.MONGODB_URL;
var DB_NAME = env.DB_NAME;

// Khởi tạo đối tượng ban đầu
var trelloDbInstance = null;
// Khởi tạo một đối tượng để kết nối tới MongoDB
var mongoClinetInstance = new MongoClient(MONGODB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});
// Kết nối tới DB
var CONNECT_DB = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return mongoClinetInstance.connect();
        case 2:
          // kết nối thành công thì lấy DB theo tên và gán ngược nó lại vào biến
          trelloDbInstance = mongoClinetInstance.db(DB_NAME);
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function CONNECT_DB() {
    return _ref.apply(this, arguments);
  };
}();
var GET_DB = exports.GET_DB = function GET_DB() {
  if (!trelloDbInstance) throw new Error("Must connect to database first!");
  return trelloDbInstance;
};
module.exports = {
  CONNECT_DB: CONNECT_DB,
  GET_DB: GET_DB
};