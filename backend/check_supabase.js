const supabase = require('./cloud/supabaseClient');
if (supabase) {
  const { data } = supabase.storage.from('uploads').getPublicUrl('test.txt');
  console.log('Public URL for test.txt:', data.publicUrl);
} else {
  console.log('Supabase client failed to initialize');
}
process.exit(0);
