const { slugify } = require("~/utils/formatters")
const boardModel = require("~/models/boardModel")
const ApiError = require("~/utils/ApiError")
const { StatusCodes } = require("http-status-codes")
const { cloneDeep } = require("lodash")
const columnModel = require("~/models/columnModel");
const cardModel = require("~/models/cardModel");
const createNew = async (userId, reqBody) => {
	try {
		const newBoard = {
			...reqBody,
			slug: slugify(reqBody.title)
		}

		// Goi tang Model de xu ly luu ban ghi newBoard vao trong DB
		const createdBoard = await boardModel.createNew(userId, newBoard)

		const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

		return getNewBoard
	} catch (error) {
		throw error
	}
}

const getDetails = async (userId, boardId) => {
	try {
		const board = await boardModel.getDetails(userId, boardId)
		if (!board) {
			throw new ApiError(StatusCodes.NOT_FOUND, "Board Not Found!")
		}

		const resBoard = cloneDeep(board)
		resBoard.columns.forEach((column) => {
			column.cards = resBoard.cards.filter((card) => card.columnId.equals(column._id))
			// column.cards = resBoard.cards.filter(
			// 	(card) => card.columnId.toString() === column._id.toString()
			// )
		})

		delete resBoard.cards
		return resBoard
	} catch (error) {
		throw error
	}
}

const update = async (boardId, reqBody) => {
	try {
		const updateData = {
			...reqBody,
			updatedAt: Date.now()
		}
		const updatedBoard = await boardModel.update(boardId, updateData)
		return updatedBoard
	} catch (error) {
		throw error
	}
}
const moveCardToDifferentColumn = async (reqBody) => {
	try {
		await columnModel.update(reqBody.prevColumnId, {
			cardOrderIds: reqBody.prevCardOrderIds,
			updateAt: Date.now()
		});

		await columnModel.update(reqBody.nextColumnId, {
			cardOrderIds: reqBody.nextCardOrderIds,
			updateAt: Date.now()
		});

		await cardModel.update(reqBody.currentCardId,{
			columnId: reqBody.nextColumnId
		})

		return { updateResult: 'Successfully' }
	} catch (error) {
		throw error
	}
}

const getBoards = async (userId, page, itemsPerPage) => {
	try {
		// nếu không tồn tại giá trị page hoặc itemsPerPage thì BE phải luôn gán giá trị mặc định
		if(!page) page = 1
		if(!itemsPerPage) itemsPerPage = 12

		const result = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage), 10);
		return result
	} catch (error) {throw error}

}
module.exports = { createNew, getDetails, update, moveCardToDifferentColumn, getBoards }
