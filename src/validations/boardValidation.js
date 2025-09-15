const Joi = require("joi");
const { StatusCodes } = require("http-status-codes");
const ApiError = require("~/utils/ApiError");
const { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } = require("~/utils/validators");

const createNew = async (req, res, next) => {
	const correctCondition = Joi.object({
		title: Joi.string().required().min(3).max(50).trim().strict(),
		description: Joi.string().required().min(3).max(256).trim().strict(),
		type: Joi.string().valid("public", "private").required()
	});
	try {
		// Set abortEarly: false để chỉ định trường hợp có nhiều lỗi validation thì trả về tất cả
		await correctCondition.validateAsync(req.body, { abortEarly: false });
		// Validate data xong xuoi thi cho req di tiep sang controller
		next();
	} catch (error) {
		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
	}
};

const update = async (req, res, next) => {
	const correctCondition = Joi.object({
		title: Joi.string().min(3).max(50).trim().strict(),
		description: Joi.string().min(3).max(256).trim().strict(),
		type: Joi.string().valid("public", "private"),
		columnOrderIds: Joi.array().items(
			Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
		)
	});
	try {
		// Set abortEarly: false để chỉ định trường hợp có nhiều lỗi validation thì trả về tất cả
		await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
		next();
	} catch (error) {
		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
	}
};

const moveCardToDifferentColumn = async (req, res, next) => {
	const correctCondition = Joi.object({
		currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
		prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
		prevCardOrderIds: Joi.array().required().items(
			Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
		),
		nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
		nextCardOrderIds: Joi.array().required().items(
			Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
		)
	});
	try {
		// Set abortEarly: false để chỉ định trường hợp có nhiều lỗi validation thì trả về tất cả
		await correctCondition.validateAsync(req.body, { abortEarly: false});
		next();
	} catch (error) {
		next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message));
	}
};
module.exports = { createNew, update, moveCardToDifferentColumn };
