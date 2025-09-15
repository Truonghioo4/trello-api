const Joi = require("joi")
const {
	OBJECT_ID_RULE,
	OBJECT_ID_RULE_MESSAGE,
	EMAIL_RULE,
	EMAIL_RULE_MESSAGE
} = require("~/utils/validators.js")
const { GET_DB } = require("~/config/mongodb.js")
const { ObjectId } = require("mongodb")
// Define Collection (name & schema)
const CARD_COLLECTION_NAME = "cards"
const CARD_COLLECTION_SCHEMA = Joi.object({
	boardId: Joi.string()
		.required()
		.pattern(OBJECT_ID_RULE)
		.message(OBJECT_ID_RULE_MESSAGE),
	columnId: Joi.string()
		.required()
		.pattern(OBJECT_ID_RULE)
		.message(OBJECT_ID_RULE_MESSAGE),

	title: Joi.string().required().min(3).max(50).trim().strict(),
	description: Joi.string().optional(),
	cover: Joi.string().default(null),
	memberIds: Joi.array()
		.items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
		.default([]),
	// Dữ liệu comments của Card chúng ta sẽ học cách nhúng - embedded vào bản ghi Card luôn như dưới đây:
	comments: Joi.array()
		.items({
			userId: Joi.string()
				.pattern(OBJECT_ID_RULE)
				.message(OBJECT_ID_RULE_MESSAGE),
			userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
			userAvatar: Joi.string(),
			userDisplayName: Joi.string(),
			content: Joi.string(),
			// Chỗ này lưu ý vì dùng hàm $push để thêm comment nên không set default Date.now luôn giống hàm insertOne khi create được.
			commentedAt: Joi.date().timestamp()
		})
		.default([]),

	createdAt: Joi.date().timestamp("javascript").default(Date.now),
	updatedAt: Joi.date().timestamp("javascript").default(null),
	_destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ["_id", "boardId", "createdAt"]

const validateBeforeCreate = async (data) => {
	return await CARD_COLLECTION_SCHEMA.validateAsync(data, {
		abortEarly: false
	})
}

const createNew = async (data) => {
	try {
		const validData = await validateBeforeCreate(data)

		// Biến đổi một số dữ liệu liên quan tới Id chuẩn chỉnh
		const newCardToAdd = {
			...validData,
			boardId: new ObjectId(String(validData.boardId)),
			columnId: new ObjectId(String(validData.columnId))
		}
		const createdCard = await GET_DB()
			.collection(CARD_COLLECTION_NAME)
			.insertOne(newCardToAdd)
		return createdCard
	} catch (error) {
		throw new Error(error)
	}
}
const findOneById = async (id) => {
	try {
		const result = await GET_DB()
			.collection(CARD_COLLECTION_NAME)
			.findOne({ _id: new ObjectId(String(id)) })
		return result
	} catch (error) {
		throw new Error(error)
	}
}

const update = async (cardId, updateData) => {
	try {
		Object.keys(updateData).forEach((fieldName) => {
			if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
				delete updateData[fieldName]
			}
		})

		if (updateData.columnId)
			updateData.columnId = new ObjectId(String(updateData.columnId))

		const result = await GET_DB()
			.collection(CARD_COLLECTION_NAME)
			.findOneAndUpdate(
				{ _id: new ObjectId(String(cardId)) },
				{ $set: updateData },
				{ returnDocument: "after" }
			)
		return result
	} catch (error) {
		throw new Error(error)
	}
}

const deleteManyByColumnId = async (columnId) => {
	try {
		const result = await GET_DB()
			.collection(CARD_COLLECTION_NAME)
			.deleteMany({ columnId: new ObjectId(String(columnId)) })
		return result
	} catch (error) {
		throw new Error(error)
	}
}

module.exports = {
	CARD_COLLECTION_NAME,
	CARD_COLLECTION_SCHEMA,
	createNew,
	findOneById,
	update,
	deleteManyByColumnId
}
