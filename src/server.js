const express = require("express")
const cors = require("cors")
const { corsOptions } = require("~/config/cors.js")
const { CONNECT_DB } = require("./config/mongodb.js")
const APIs_v1 = require("~/routes/v1")
const errorHandlingMiddleware = require("~/middlewares/errorHandlingMiddleware.js")
const cookieParser = require("cookie-parser")
const env = require("./config/environment.js")

const START_SERVER = () => {
	const app = express()
	// Fix cái vụ Cache from disk của ExpressJS
	// https://stackoverflow.com/a/53240717/8324172
	app.use((req, res, next) => {
		res.set("Cache-Control", "no-store")
		next()
	})

	// Cấu hình cookie parser
	app.use(cookieParser())

	// Xu ly CORS
	app.use(cors(corsOptions))

	// Enable req.body json data
	app.use(express.json())

	//Use API v1
	app.use("/v1", APIs_v1)

	// Middleware xử lý lỗi tập trung
	app.use(errorHandlingMiddleware)

	const port = env.PORT
	app.listen(port, () => {
		console.log(
			`Hello Truong Nguyen, I'm running server at http://localhost:${port}`
		)
	})
}

// Chỉ khi kết nối DB thành công thì mới start server
CONNECT_DB()
	.then(() => {
		console.log("Connected to MongoDB")
	})
	.then(() => START_SERVER())
	.catch((err) => {
		console.error(err)
		process.exit(0)
	})
