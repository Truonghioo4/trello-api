const JWT = require('jsonwebtoken')

/*
 * Function tạo một token mới - Cần 3 tham số đầu vào
 * userInfo: Những thông tin muốn đính kèm vào token
 * secretSignature: Chữ ký bí mật (dạng một chuỗi string ngẫu nhiên) trên docs thì để tên là privateKey tùy đều được
 * tokenLife: Thời gian sống của token
 */
const generateToken = async (userInfo, secretSignature, tokenLife)=>{
  try {
    return JWT.sign(userInfo, secretSignature, {algorithm: 'HS256', expiresIn: tokenLife})
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Function kiểm tra một token có hợp lệ hay không
 * Hợp lệ ở đây hiểu đơn giản là cái token được tạo ra có đúng với cái chữ ký bí mật secretSignature trong dự án hay không
 */
const verifyToken = async (token, secretSignature)=>{
  try {
    // Hàm verify của thư viện JWT
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {generateToken, verifyToken}
