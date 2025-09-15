// ta không dùng mongoose
const env = require('./environment')
const { MongoClient, ServerApiVersion } = require("mongodb")
const MONGODB_URL = env.MONGODB_URL
const DB_NAME = env.DB_NAME

// Khởi tạo đối tượng ban đầu
let trelloDbInstance = null
// Khởi tạo một đối tượng để kết nối tới MongoDB
const mongoClinetInstance = new MongoClient(MONGODB_URL, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
})
// Kết nối tới DB
const CONNECT_DB = async () => {
	// Gọi kết nối tới MongoDB với URL đã khai báo
	await mongoClinetInstance.connect()

	// kết nối thành công thì lấy DB theo tên và gán ngược nó lại vào biến
	trelloDbInstance = mongoClinetInstance.db(DB_NAME)
}

export const GET_DB = () => {
	if (!trelloDbInstance) throw new Error("Must connect to database first!")
	return trelloDbInstance
}

module.exports = { CONNECT_DB, GET_DB }
