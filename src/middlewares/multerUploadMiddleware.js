const multer = require('multer')
const { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } = require('~/utils/validators')

// function kiem tra xem loai file nao duoc chap nhan
const customFileFilter = (req, file, callback) => {
  // console.log("Multer File: ", file)

  // Đối với multer kiểm tra kiểu file thì sử dụng mimetype
  if(!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)){
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(errMessage, null)
  }

  // Nếu kiểu file hợp lệ
  return callback(null, true)
}

// Khởi tạo function upload được bọc bởi multer
const upload = multer({
  limits: {fileSize: LIMIT_COMMON_FILE_SIZE},
  fileFilter: customFileFilter
})

module.exports = { upload }