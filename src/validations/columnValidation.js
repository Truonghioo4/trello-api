const Joi = require("joi")
const { StatusCodes } = require("http-status-codes")
const ApiError = require("~/utils/ApiError")
const { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } = require("~/utils/validators")

const createNew = async (req, res, next) => {
	const correctCondition = Joi.object({
		boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
		title: Joi.string().required().min(3).max(50).trim().strict()
	})
	try {
		// Set abortEarly: false để chỉ định trường hợp có nhiều lỗi validation thì trả về tất cả
		await correctCondition.validateAsync(req.body, { abortEarly: false })
		// Validate data xong xuoi thi cho req di tiep sang controller
		next()
	} catch (error) {
		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
	}
}

const update = async (req, res, next) => {
	const correctCondition = Joi.object({
		boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
		title: Joi.string().min(3).max(50).trim().strict(),
		cardOrderIds: Joi.array().items(
			Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
		)
	})
	try {
		// Set abortEarly: false để chỉ định trường hợp có nhiều lỗi validation thì trả về tất cả
		await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
		next()
	} catch (error) {
		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
	}
}

const deleteItem = async (req, res, next) => {
	const correctCondition = Joi.object({
		id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
	})
	try {
		await correctCondition.validateAsync(req.params)
		next()
	} catch (error) {
		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
	}
}
module.exports = { createNew, update, deleteItem }
