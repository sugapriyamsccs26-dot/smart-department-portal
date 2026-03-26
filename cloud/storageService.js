const supabase = require('./supabaseClient');
const fs = require('fs');
const path = require('path');

const storageService = {
  /**
   * Upload a local file to Supabase Storage
   * @param {string} localPath - The absolute path to the local file
   * @param {string} bucket - The Supabase Storage bucket name (e.g., 'uploads')
   * @param {string} fileName - The desired file name in the cloud (keep similar to local)
   */
  async uploadFile(localPath, bucket = 'uploads', fileName) {
    if (!supabase) return;
    try {
      const fileBuffer = fs.readFileSync(localPath);
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) console.error(`❌ Cloud Storage Error [${fileName}]:`, error.message);
      else console.log(`☁️ Cloud Storage Uploaded: [${fileName}]`);
      
      return data?.path;
    } catch (err) {
      console.error(`⚠️ Cloud Storage Exception [${fileName}]:`, err.message);
    }
  }
};

module.exports = storageService;
