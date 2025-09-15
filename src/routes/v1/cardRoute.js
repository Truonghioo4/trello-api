const express = require("express")
const cardValidation = require("~/validations/cardValidation")
const cardController = require("~/controllers/cardController")
const authMiddleware = require('~/middlewares/authMiddleware')
const multerUploadMiddleware = require('~/middlewares/multerUploadMiddleware')
const Router = express.Router()
Router.route("/").post(authMiddleware.isAuthorized,cardValidation.createNew, cardController.createNew)
Router.route("/:id").put(
  authMiddleware.isAuthorized,
  multerUploadMiddleware.upload.single('cardCover'),
  cardValidation.update, 
  cardController.update
)

module.exports = Router
