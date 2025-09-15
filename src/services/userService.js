const { StatusCodes } = require('http-status-codes')
const userModel = require('~/models/userModel')
const ApiError = require('~/utils/ApiError')
const bcryptjs = require('bcryptjs')
const { v4 } = require('uuid')
const { pickUser } = require('~/utils/formatters')
const ResendProvider = require('~/providers/ResendProvider')
const env  = require('~/config/environment')
const JwtProvider  = require('~/providers/JwtProvider')
const CloudinaryProvider  = require('~/providers/CloudinaryProvider')
const createNew = async (reqBody)=>{
  try {
    // Kiểm tra email đã tồn tại trong hệ thống hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if(existUser) throw ApiError(StatusCodes.CONFLICT, 'Email already exists!')

    // Tạo data để lưu vào database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: v4()
    }

    // Thực hiện lưu thông tin vào db
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `http://localhost:5173/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const to = [getNewUser.email]
    const subject = 'Trello: Please verify your email before using our services!'
    const html = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,<br/> - Trungquandev – Một Lập Trình Viên – </h3>
    `
    //  Gọi tới cái Provider gửi mail
    await ResendProvider.sendEmail({ to , subject, html})
    
    // Trả về dữ liệu cho controller
    return pickUser(getNewUser)
  } catch (error) { throw error }
}

const verifyAccount = async (reqBody) =>{
  try {
    // Lấy user trong db
    const existUser = await userModel.findOneByEmail(reqBody.email)
    // Check user
    if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if(existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active')
    // console.log(existUser)
    // console.log('reqBody Token: ', reqBody.token)
    // console.log('verified Token: ', existUser.verifyToken)
    if(reqBody.token !== existUser.verifyToken){
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid')
    }
    // Nếu mọi thứ đã ok, bắt đầu update lại thông tin của user để verify tài khoản
    const updateData = {
      isActive : true,
      verifyToken: null
    }
    // thực hiện update thông tin user
    const updatedUser = await userModel.update(existUser._id, updateData)
    return pickUser(updatedUser)

  } catch (error) {
    throw error
  }
}

const login = async (reqBody) =>{
  try {
    // Lấy user trong db
    const existUser = await userModel.findOneByEmail(reqBody.email)
    // Check user
    if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if(!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if(!bcryptjs.compareSync(reqBody.password, existUser.password)){
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!')
    }
    /* Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE
      Tạo thông tin để đính kèm trong JWT Token bao gồm _id và email của user*/
    const userInfo ={ _id: existUser._id, email: existUser.email }
    // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5 test 5 giay
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
      // 15 test 15 giay
    )
    // Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) }

  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) =>{
  try {
    // Verify / giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken, 
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )
    // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi, vì vậy có thể
    // lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data mới.
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tạo access Token mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5 test 5 giay
    )
    return { accessToken }
  } catch (error) { throw error }
}

const update = async (userId, reqBody, userAvatarFile) => {
  console.log(userId)
  try {
    // Query và kiểm tra cho chắc chắn
    const existUser = await userModel.findOneById(userId)
    if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if(!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    // Khởi tạo kết quả  updated User ban đầu là empty
    let updatedUser = {}
    
    // Trường hợp change password
    if(reqBody.current_password && reqBody.new_password){
      // kiểm tra mật khẩu hiện tại có đúng không
      if(!bcryptjs.compareSync(reqBody.current_password, existUser.password)){
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is incorrect!')
      }
      // Nếu đúng thì sẽ hash một mk mới và update lại vào DB
      updatedUser = await userModel.update(userId, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      // Trường hợp upload file lên clound storage
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      // console.log("uploadResult: ", uploadResult)

      // Lưu lại url của cái file ảnh vào trong db
      updatedUser = await userModel.update(userId, {
        avatar: uploadResult.secure_url
      })
    } else {
      updatedUser = await userModel.update(userId, reqBody)
    }
    return pickUser(updatedUser)
  } catch (error) { throw error }
}

module.exports = {createNew, verifyAccount, login, refreshToken, update}