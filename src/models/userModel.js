const Joi = require("joi");
const { ObjectId } = require("mongodb");
const { EMAIL_RULE, EMAIL_RULE_MESSAGE} = require("~/utils/validators");
const { GET_DB } = require("~/config/mongodb");

const USER_ROLE = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

const USER_COLLECTION_NAME = 'user'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),

  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(USER_ROLE.CLIENT, USER_ROLE.ADMIN).default(USER_ROLE.CLIENT),

  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const INVALID_UPDATE_FIELDS = ["_id", 'email', 'username',"createdAt"]

const createNew = async (data) =>{
  try {
    const validData = await validateBeforeCreate(data)
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
    return createdUser
  } catch (error) {
      throw new Error(error)
  }
}

const findOneById = async (userId) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(String(userId)) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByEmail = async (emailValue) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME)
      .findOne({ email: emailValue })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (userId, updateData) => {
  try {
    // Lọc những field mà chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(userId)) },
        { $set: updateData },
        { returnDocument: 'after' } // sẽ trả về kết quả mới sau khi cập nhật
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
module.exports = {USER_COLLECTION_NAME, USER_COLLECTION_SCHEMA, USER_ROLE, createNew, findOneById, findOneByEmail, update}

