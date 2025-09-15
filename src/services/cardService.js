const cardModel = require("~/models/cardModel")
const columnModel = require("~/models/columnModel")
const CloudinaryProvider  = require('~/providers/CloudinaryProvider')
const createNew = async (reqBody) => {
	try {
		const newCard = {
			...reqBody,
		}

		// Goi tang Model de xu ly luu ban ghi newCard vao trong DB
		const createdCard = await cardModel.createNew(newCard)

		const getNewCard = await cardModel.findOneById(createdCard.insertedId)

		if (getNewCard) {
			await columnModel.pushCardOrderIds(getNewCard)
		}

		return getNewCard
	} catch (error) {
		throw error
	}
}

const update = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
		let updatedCard = {}
		if(cardCoverFile){
			const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')

			updatedCard = await cardModel.update(cardId, {
				cover: uploadResult.secure_url
			})

		} else {
			// Các update chung như title, description
			updatedCard = await cardModel.update(cardId, updateData)
		}
    return updatedCard
  } catch (error) { throw error }
}

module.exports = { createNew, update }
