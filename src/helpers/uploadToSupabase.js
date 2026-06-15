const { createClient, BUCKET_NAME } =
  require('../../configs/constants').constants;

// Helper function to upload a file to Supabase.
const uploadToSupabase = async (file) => {
  try {
    // Supabase config
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
    );

    // Generate a unique file name using the current timestamp and original file name.
    const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;

    // Upload the file to Supabase storage in the provided bucket.
    // The file is uploaded with the original file name and content type.
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    // Check for errors during the upload.
    if (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file to Supabase');
    }

    // Get the public URL of the uploaded file
    const { data: publicUrl } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // Success response.
    return {
      publicUrl: publicUrl,
      fileName: fileName,
      fullPath: data.fullPath,
    };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw new Error('Failed to upload file to Supabase');
  }
};

module.exports = uploadToSupabase;
