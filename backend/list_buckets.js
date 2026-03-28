const supabase = require('./cloud/supabaseClient');

async function listBuckets() {
  if (!supabase) {
    console.log('Supabase not configured');
    return;
  }
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.log('Error listing buckets:', error.message);
  } else {
    console.log('Buckets found:', JSON.stringify(data, null, 2));
  }
}

listBuckets();
