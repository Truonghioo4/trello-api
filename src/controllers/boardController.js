const { StatusCodes } = require("http-status-codes")
const boardService = require("~/services/boardService")
const createNew = async (req, res, next) => {
	try {
		const userId = req.jwtDecoded._id
		// điều hướng dữ liệu
		const createdBoard = await boardService.createNew(userId, req.body)

		// có kết quả thì trả về phía client
		res.status(StatusCodes.CREATED).json(createdBoard)
	} catch (error) {
		next(error)
	}
}

const getDetails = async (req, res, next) => {
	try {
		const boardId = req.params.id
		const userId = req.jwtDecoded._id
		const board = await boardService.getDetails(userId, boardId)
		res.status(StatusCodes.OK).json(board)
	} catch (error) {
		next(error)
	}
}

const update = async (req, res, next) => {
	try {
		const boardId = req.params.id
		const updatedBoard = await boardService.update(boardId, req.body)
		res.status(StatusCodes.OK).json(updatedBoard)
	} catch (error) {
		next(error)
	}
}

const moveCardToDifferentColumn = async (req, res, next) => {
	try {
		const result = await boardService.moveCardToDifferentColumn(req.body)
		res.status(StatusCodes.OK).json(result)
	} catch (error) {
		next(error)
	}
}

const getBoards = async (req, res, next) => {
	try {
		const userId = req.jwtDecoded._id
		// page và itemPerPage được truyền vào trong query url từ phía FE nên BE sẽ lấy thông qua req.query
		const {page, itemsPerPage} = req.query
		const result = await boardService.getBoards(userId, page, itemsPerPage)
		res.status(StatusCodes.OK).json(result)
	} catch (error) { next(error) }
}

module.exports = { createNew, getDetails, update,moveCardToDifferentColumn, getBoards }
