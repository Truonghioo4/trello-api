const { StatusCodes } = require("http-status-codes")
const columnService = require("~/services/columnService")
const createNew = async (req, res, next) => {
	try {
		// điều hướng dữ liệu
		const createdColumn = await columnService.createNew(req.body)

		// có kết quả thì trả về phía client
		res.status(StatusCodes.CREATED).json(createdColumn)
	} catch (error) {
		next(error)
	}
}

const update = async (req, res, next) => {
	try {
		const columnId = req.params.id
		const updatedColumn = await columnService.update(columnId, req.body)
		res.status(StatusCodes.OK).json(updatedColumn)
	} catch (error) {
		next(error)
	}
}

const deleteItem = async (req, res, next) => {
	try {
		const columnId = req.params.id
		const result = await columnService.deleteItem(columnId)
		res.status(StatusCodes.OK).json(result)
	} catch (error) {
		next(error)
	}
}

module.exports = { createNew, update, deleteItem }
