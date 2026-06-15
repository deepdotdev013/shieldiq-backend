const { RESPONSE_CODES, VALIDATION_EVENTS, UUID } =
  require('../../../configs/constants').constants;
const { validateMediaData } = require('../../validations/MediaValidation');
const { Media } = require('../../models');
const uploadToSupabase = require('../../helpers/uploadToSupabase');

module.exports = {
  /**
   * @name uploadSingleMedia
   * @path /user/media/upload-single
   * @method POST
   * @schema Media
   * @param {object} - req.file - file to upload
   * @param {string} - req.body.mediaType - typf of the media ('image' or 'video')
   * @param {number} - req.body.duration - duration of the media
   * @description This method is used to upload a single media file to the supabase and media table.
   * @returns {Object} JSON object containing the media data
   * @author Deep Panchal
   */
  uploadSingleMedia: async (req, res) => {
    try {
      // Create a mediaData object.
      const mediaData = {
        userId: req.user.id,
        file: req.file,
        mediaType: req.body.mediaType,
        duration: req.body.duration || 0,
        eventCode: VALIDATION_EVENTS.UploadMedia,
      };

      // Check if the file is present in the request.
      if (!mediaData.file) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__('FILE_NOT_FOUND'),
          data: null,
        });
      }

      // If the file is present then add the mimetype to it.
      mediaData.mimetype = req.file.mimetype.split('/')?.[1];

      // Validate the incoming data
      const result = validateMediaData(mediaData);

      // If the validation fails, send an error
      if (result.hasError) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__('VALIDATION_ERROR'),
          error: result.errors,
        });
      }

      // Call the uploadToSupabase helper to upload the file.
      const uploadedFile = await uploadToSupabase(mediaData.file);

      // File upload failed.
      if (!uploadedFile) {
        return res.status(RESPONSE_CODES.BadRequest).json({
          status: RESPONSE_CODES.BadRequest,
          message: req.__('FILE_UPLOAD_ERROR'),
          data: null,
        });
      }

      // Add the uploaded file data to the database.
      const uploadedFileData = await Media.create({
        id: UUID.v4(),
        mediaUrl: uploadedFile?.publicUrl?.publicUrl,
        mediaType: mediaData.mediaType,
        mimeType: mediaData.mimetype,
        fileName: uploadedFile?.fileName,
        fullPath: uploadedFile?.fullPath,
        duration: mediaData.duration,
        createdBy: mediaData.userId,
      });

      // Success Response.
      return res.status(RESPONSE_CODES.Ok).json({
        status: RESPONSE_CODES.Ok,
        message: req.__('FILE_UPLOADED_SUCCESSFULLY'),
        data: uploadedFileData,
      });
    } catch (error) {
      console.error('Error in UploadMedia policy:', error);

      return res.status(RESPONSE_CODES.ServerError).json({
        status: RESPONSE_CODES.ServerError,
        message: req.__('WENTS_WRONG'),
        data: null,
      });
    }
  },
};
