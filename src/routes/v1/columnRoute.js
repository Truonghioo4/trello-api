const express = require("express")
const columnValidation = require("~/validations/columnValidation")
const columnController = require("~/controllers/columnController")
const authMiddleware = require('~/middlewares/authMiddleware')
const Router = express.Router()
Router.route("/").post(authMiddleware.isAuthorized, columnValidation.createNew, columnController.createNew)

Router.route("/:id")
  .put(authMiddleware.isAuthorized, columnValidation.update, columnController.update)
  .delete(authMiddleware.isAuthorized, columnValidation.deleteItem, columnController.deleteItem)

module.exports = Router
