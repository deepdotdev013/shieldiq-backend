const { RESPONSE_CODES, MULTER, ALLOWED_FILE_TYPES } =
  require('../../configs/constants').constants;

module.exports.UploadMedia = async (req, res, next) => {
  try {
    // Filter for multer.
    const fileFilter = (req, file, cb) => {
      try {
        if (
          Object.values(ALLOWED_FILE_TYPES).includes(
            file.mimetype.split('/')[1],
          )
        ) {
          cb(null, true);
        } else {
          cb(new Error('Invalid File type'));
        }
      } catch (error) {
        cb(new Error(error));
      }
    };

    // Multer configuration
    const upload = MULTER({
      storage: MULTER.memoryStorage(),
      limits: {
        fileSize: 1024 * 1024 * 50, // 50 MB
      },
      fileFilter: fileFilter,
    });

    // Function to handle errors while file upload
    upload.single('file')(req, res, (error) => {
      if (error instanceof MULTER.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(RESPONSE_CODES.BadRequest).json({
            status: RESPONSE_CODES.BadRequest,
            message: req.__('TOO_LARGE_FILE'),
            data: null,
          });
        }
      } else if (error) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: error.message,
          data: null,
        });
      }

      next();
    });
  } catch (error) {
    console.error('Error in UploadMedia policy:', error);

    return res.status(RESPONSE_CODES.BadRequest).json({
      status: RESPONSE_CODES.BadRequest,
      message: req.__('FILE_UPLOAD_FAILED'),
      data: null,
    });
  }
};
