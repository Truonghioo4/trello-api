const express = require("express")
const boardValidation = require("~/validations/boardValidation.js")
const boardController = require("~/controllers/boardController.js")
const authMiddleware = require('~/middlewares/authMiddleware')

const Router = express.Router()
Router.route("/")
	.get(authMiddleware.isAuthorized, boardController.getBoards)
	.post(authMiddleware.isAuthorized,boardValidation.createNew, boardController.createNew)

Router.route("/:id")
	.get(authMiddleware.isAuthorized, boardController.getDetails)
	.put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)

Router.route("/supports/moving_card")
	.put(authMiddleware.isAuthorized, boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)

module.exports = Router
