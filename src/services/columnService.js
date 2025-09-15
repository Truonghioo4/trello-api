const columnModel = require("~/models/columnModel")
const cardModel = require("~/models/cardModel")
const boardModel = require("~/models/boardModel")
const ApiError = require("~/utils/ApiError")
const { StatusCodes } = require("http-status-codes")
const createNew = async (reqBody) => {
	try {
		const newColumn = {
			...reqBody,
		}

		// Goi tang Model de xu ly luu ban ghi newColumn vao trong DB
		const createdColumn = await columnModel.createNew(newColumn)
		const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

		if(getNewColumn){
			getNewColumn.cards = []
			// Cập nhật lại mảng columnOrderIds trong collection board
			await boardModel.pushColumnOrderIds(getNewColumn)
		}

		return getNewColumn
	} catch (error) {
		throw error
	}
}

const update = async (columnId, reqBody) => {
	try {
		const updateData = {
			...reqBody,
			updatedAt: Date.now()
		}
		const updatedColumn = await columnModel.update(columnId, updateData)
		return updatedColumn
	} catch (error) {
		throw error
	}
}

const deleteItem = async (columnId) => {
	try {
		const targetColumn = await columnModel.findOneById(columnId)

		if(!targetColumn){
			throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
		}
		// Xoa Column
		await columnModel.deleteOneById(columnId)

		//Xoa Toan Bo Card Thuoc Column
		await cardModel.deleteManyByColumnId(columnId)

		//Xoa columnId trong mang columnOrderIds cua board chua no
		await boardModel.pullColumnOrderIds(targetColumn)
		
		return {deleteResult: 'Column and its Cards deleted successfully!'}
	} catch (error) {
		throw error
	}
}
module.exports = { createNew, update, deleteItem }
