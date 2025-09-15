const cloudinary = require('cloudinary')
const streamifier = require('streamifier')
const env  = require('~/config/environment')

// Bước đầu cấu hình cloudinary, sử dụng v2 
const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

// Khởi tạo function để thực hiện upload file lên cloudinary
const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) =>{
    // Tạo luồng stream upload lên cloud
    const stream = cloudinaryV2.uploader.upload_stream({folder: folderName}, (err, result)=>{
      if(err) reject(err)
      else resolve(result)
    })
    // Thực hiện upload luồng trên bằng streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}
 
module.exports = { streamUpload }