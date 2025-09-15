const express = require("express")
const Router = express.Router()
const { StatusCodes } = require("http-status-codes")
const boardRoute = require("~/routes/v1/boardRoute")
const columnRoute = require("~/routes/v1/columnRoute.js")
const cardRoute = require("~/routes/v1/cardRoute.js")
const userRoute = require("~/routes/v1/userRoute.js")
Router.get("/status", (req, res) => {
	res.status(StatusCodes.OK).json({ message: "APIs v1 are ready to use!" })
})
// Board APIs
Router.use("/boards", boardRoute)

// Column APIs
Router.use("/columns", columnRoute)

// Card APIs
Router.use("/cards", cardRoute)

// User APIs
Router.use('/users', userRoute)

module.exports = Router
