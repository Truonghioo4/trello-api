const express = require('express')
const userValidation = require('~/validations/userValidation.js')
const userController = require('~/controllers/userController')
const authMiddleware = require('~/middlewares/authMiddleware')
const multerUploadMiddleware = require('~/middlewares/multerUploadMiddleware')

const Router = express.Router()

Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

Router.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

Router.route('/login')
  .post(userValidation.login, userController.login)

Router.route('/logout')
  .delete(userController.logout)

Router.route('/refresh_token')
  .get(userController.refreshToken)

Router.route('/update')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('avatar'),
    userValidation.update, 
    userController.update
  )

module.exports = Router