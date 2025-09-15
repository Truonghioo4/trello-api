const { StatusCodes } = require("http-status-codes")
const cardService = require("~/services/cardService")
const createNew = async (req, res, next) => {
	try {
		// điều hướng dữ liệu
		const createdCard = await cardService.createNew(req.body)

		// có kết quả thì trả về phía client
		res.status(StatusCodes.CREATED).json(createdCard)
	} catch (error) {
		next(error)
	}
}

const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
		const cardCoverFile = req.file
    const updatedCard = await cardService.update(cardId, req.body, cardCoverFile)

    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) {
    next(error)
  }
}

module.exports = { createNew, update }
