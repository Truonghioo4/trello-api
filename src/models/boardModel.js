const Joi = require("joi")
const { ObjectId } = require("mongodb")
const {
	OBJECT_ID_RULE,
	OBJECT_ID_RULE_MESSAGE
} = require("~/utils/validators")
const { GET_DB } = require("~/config/mongodb")
const columnModel = require("~/models/columnModel.js")
const cardModel = require("~/models/cardModel.js")
const userModel = require("~/models/userModel")
const { pagingSkipValue } = require("~/utils/algorithms")
// Define Collection (Name & Schema)
const BOARD_COLLECTION_NAME = "boards"
const BOARD_COLLECTION_SCHEMA = Joi.object({
	title: Joi.string().required().min(3).max(50).trim().strict(),
	slug: Joi.string().required().min(3).trim().strict(),
	description: Joi.string().required().min(3).max(256).trim().strict(),
	type: Joi.string().valid("public", "private").required(),
	columnOrderIds: Joi.array()
		.items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
		.default([]),
	// Những admin của board
	ownerIds: Joi.array()
		.items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
		.default([]),

	// Những thành viên của board
	memberIds: Joi.array()
		.items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
		.default([]),

	createdAt: Joi.date().timestamp("javascript").default(Date.now),
	updatedAt: Joi.date().timestamp("javascript").default(null),
	_destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ["_id", "createdAt"]

const validateBeforeCreate = async (data) => {
	return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
		abortEarly: false
	})
}

const createNew = async (userId, data) => {
	try {
		const vaildData = await validateBeforeCreate(data)
		const newBoardToAdd = {
			...vaildData,
			ownerIds: [new ObjectId(String(userId))]
		}
		const createdBoard = await GET_DB()
			.collection(BOARD_COLLECTION_NAME)
			.insertOne(newBoardToAdd)
		return createdBoard
	} catch (error) {
		throw new Error(error)
	}
}
const findOneById = async (id) => {
	try {
		const result = await GET_DB()
			.collection(BOARD_COLLECTION_NAME)
			.findOne({ _id: new ObjectId(String(id)) })
		return result
	} catch (error) {
		throw new Error(error)
	}
}

const getDetails = async (userId, boardId) => {
	try {
		// const result = await GET_DB()
		// 	.collection(BOARD_COLLECTION_NAME)
		// 	.findOne({ _id: new ObjectId(String(id)) })

		const queryCondition = [
			{ _id: new ObjectId(String(boardId)) },
			{ _destroy: false },
			{
				$or: [
					{ ownerIds: { $all: [new ObjectId(String(userId))] } },
					{ memberIds: { $all: [new ObjectId(String(userId))] } }
				]
			}
		]
		const result = await GET_DB()
			.collection(BOARD_COLLECTION_NAME)
			.aggregate([
				{
					$match: { $and: queryCondition }
				},
				{
					$lookup: {
						from: columnModel.COLUMN_COLLECTION_NAME,
						localField: "_id",
						foreignField: "boardId",
						as: "columns"
					}
				},
				{
					$lookup: {
						from: cardModel.CARD_COLLECTION_NAME,
						localField: "_id",
						foreignField: "boardId",
						as: "cards"
					}
				},
				{
					$lookup: {
						from: userModel.USER_COLLECTION_NAME,
						localField: "ownerIds",
						foreignField: "_id",
						as: "owners",
						// pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
						// $project để chỉ định vài field không muốn lấy về bằng cách gán nó giá trị 0
						pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
					}
				},
				{
					$lookup: {
						from: userModel.USER_COLLECTION_NAME,
						localField: "memberIds",
						foreignField: "_id",
						as: "members",
						pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
					} }
			])
			.toArray()
		return result[0] || null
	} catch (error) {
		throw new Error(error)
	}
}

// Push một giá trị columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
	try {
		const result = await GET_DB()
			.collection(BOARD_COLLECTION_NAME)
			.findOneAndUpdate(
				{ _id: new ObjectId(String(column.boardId)) },
				{ $push: { columnOrderIds: new ObjectId(String(column._id)) } },
				{ returnDocument: "after" }
			)
		return result
	} catch (error) {
		throw new Error(error)
	}
}

const pullColumnOrderIds = async (column) => {
	try {
		const result = await GET_DB()
			.collection(BOARD_COLLECTION_NAME)
			.findOneAndUpdate(
				{ _id: new ObjectId(String(column.boardId)) },
				{ $pull: { columnOrderIds: new ObjectId(String(column._id)) } },
				{ returnDocument: "after" }
			)
		return result
	} catch (error) {
		throw new Error(error)
	}
}

const update = async (boardId, updateData) => {
	try {
		Object.keys(updateData).forEach((fieldName) => {
			if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
				delete updateData[fieldName]
			}
		})

		if (updateData.columnOrderIds) {
			updateData.columnOrderIds = updateData.columnOrderIds.map(
				(_id) => new ObjectId(String(_id))
			)
		}

		const result = await GET_DB()
			.collection(BOARD_COLLECTION_NAME)
			.findOneAndUpdate(
				{ _id: new ObjectId(String(boardId)) },
				{ $set: updateData },
				{ returnDocument: "after" }
			)
		return result
	} catch (error) {
		throw new Error(error)
	}
}

const getBoards = async (userId, page, itemsPerPage) => {
	try {
		const queryCondition = [
			// Điều kiện 1: board chưa bị xóa
			{ _destroy: false },
			// Điều kiện 2: cái userId đang thực hiện request này phải thuộc vào một trong 2 mảng ownerIds hoặc memeberIds, sử dụng toán tử %all của mongodb
			{
				$or: [
					{ ownerIds: { $all: [new ObjectId(String(userId))] } },
					{ memberIds: { $all: [new ObjectId(String(userId))] } }
				]
			}
		]

		const query = await GET_DB()
			.collection(BOARD_COLLECTION_NAME)
			.aggregate(
				[
					{ $match: { $and: queryCondition } },
					// sort title của board theo A-Z( mặc định B hoa sẽ đứng trước a thường nên cần fix)
					{ $sort: { title: 1 } },
					// $facet để sử lí nhiều luồng trong một query
					{
						$facet: {
							// luồng 01: Query boards
							queryBoards: [
								{ $skip: pagingSkipValue(page, itemsPerPage) }, // Bỏ qua số lượng bản ghi của những page trước đó
								{ $limit: itemsPerPage } // Giới hạn tối đa số lượng bản ghi trả về trên một page
							],
							// luồng 02: Query đếm tổng số lượng bản ghi boards trong db và return về biến countedAllBoards
							queryTotalBoards: [{ $count: "countedAllBoards" }]
						}
					}
				],
				// Khai báo thêm thuộc tính collation locale 'en' để fix vụ chữ B hoa ở trước a hường
				// https://www.mongodb.com/docs/v6.0/reference/collation/#std-label-collation-document-fields
				{ collation: { locale: "en" } }
			)
			.toArray()

		const res = query[0]
		return {
			boards: res.queryBoards || [],
			totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
		}
	} catch (error) {
		throw new Error(error)
	}
}
module.exports = {
	BOARD_COLLECTION_NAME,
	BOARD_COLLECTION_SCHEMA,
	createNew,
	findOneById,
	getDetails,
	pushColumnOrderIds,
	update,
	pullColumnOrderIds,
	getBoards
}