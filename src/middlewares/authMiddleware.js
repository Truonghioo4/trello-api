const { StatusCodes } = require('http-status-codes')
const JwtProvider = require('~/providers/JwtProvider')
const env  = require('~/config/environment')
const ApiError = require('~/utils/ApiError')

// Middleware này sẽ đảm nhiệm việc quan trọng: Xác thực JWT accessToken nhận đc từ phía FE có hợp lệ không
const isAuthorized = async (req, res, next) => {
  // lấy accessToken nằm trong reqúet cookie phía client - withCredentials trong file authorizeAxios
  
  const clientAccessToken = req.cookies?.accessToken
  // Nếu clientAccessToken 0 tồn tại trả về lỗi
  if(!clientAccessToken){
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return 
  }
  try {
    // Bước 01: Thực hiện giải mã token xem nó có hợp lệ hay là không
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken, 
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )

    // Bước 02: Quan trọng: Nếu như cái token hợp lệ, thì sẽ cần phải lưu thông tin giải mã được vào cái req.jwtDecoded, để sử dụng cho các tầng xử lý ở phía sau
    req.jwtDecoded = accessTokenDecoded

    // Bước 03: Cho phép cái request đi tiếp
    next()

  } catch (error) {
    // Nếu cái accessToken nó bị hết hạn (expired) thì mình cần trả về một cái mã lỗi GONE - 410 cho phía FE biết để gọi api refreshToken
    if(error?.message?.includes('jwt expired')){
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token!'))
      return
    }
    
    // Nếu như cái accessToken nó không hợp lệ do bất kỳ điều gì khác hết hạn thì chúng ta cứ thẳng tay trả về mã 401 cho phía FE gọi api sign_out luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }

}

module.exports = { isAuthorized }