const supabase = require('./cloud/supabaseClient');

async function setupSupabase() {
  if (!supabase) {
    console.log('Supabase not configured');
    return;
  }
  const bucketName = 'uploads';
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets.some(b => b.name === bucketName)) {
    console.log(`Bucket '${bucketName}' not found. Attempting to create...`);
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true, // Making it public so URLs work easily
      allowedMimeTypes: null,
      fileSizeLimit: null
    });
    if (error) {
      console.log('Error creating bucket:', error.message);
    } else {
      console.log(`Bucket '${bucketName}' created successfully!`);
    }
  } else {
    console.log(`Bucket '${bucketName}' already exists.`);
  }
}

setupSupabase();
