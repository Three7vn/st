const cloudinary = require('cloudinary');
const fs = require('fs');
const path = require('path');
const {
  REACT_APP_CLOUDINARY_NAME,
  REACT_APP_CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;
// Configure Cloudinary with your cloud name, API key, and API secret
cloudinary.config({
  cloud_name: REACT_APP_CLOUDINARY_NAME,
  api_key: REACT_APP_CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

module.exports = {
  deleteImageFromCloudinary: async (req, res) => {
    try {
      const { public_id, resource_type } = req.body;
      const destroyOptions = { resource_type }; // Pass resource_type as an option
      const { result } = await cloudinary.uploader.destroy(public_id, destroyOptions);
      if (result === 'ok') {
        return res
          .status(200)
          .json({ message: `File with public_id ${public_id} deleted successfully.` });
      } else {
        return res
          .status(400)
          .json({ message: `Failed to delete file with public_id ${public_id}` });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  uploadImageToCloudinary: async (req, res) => {
    try {
      const file = req.file;
      const filePath = req.file && req.file.path;

      if (!filePath) {
        return res.status(400).json({ message: 'File not provided.' });
      }
      const uploadOptions = { folder: req.body.folder };

      // Use cloudinary.uploader.upload for uploading files
      const data = await cloudinary.v2.uploader
        .upload(filePath, uploadOptions);

      // Remove the image file from your local file system
      fs.unlinkSync(filePath);

      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(400).json({ message: 'Failed to upload file.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },


};
