const supabase = require('./cloud/supabaseClient');
const path = require('path');

async function checkCloud() {
  if (!supabase) {
    console.log('Supabase not configured');
    return;
  }
  const fileName = '177...'; // I need to get the actual fileName from the DB properly
  // Since I don't have the exactly fileName easily from previous mangled output, I'll fetch it again.
  const Database = require('better-sqlite3');
  const db = new Database('portal.db');
  const row = db.prepare('SELECT file_path FROM study_materials WHERE id = 105').get();
  if (!row) {
    console.log('Row not found');
    return;
  }
  const filePath = row.file_path;
  const fileNameFromPath = path.basename(filePath);
  console.log('Checking file in cloud:', fileNameFromPath);
  
  const { data, error } = await supabase.storage.from('uploads').list('', { search: fileNameFromPath });
  if (error) {
    console.log('Supabase list error:', error.message);
  } else {
    console.log('Files found in cloud matching query:', JSON.stringify(data, null, 2));
  }
  
  const { data: dlData, error: dlError } = await supabase.storage.from('uploads').download(fileNameFromPath);
  if (dlError) {
     console.log('Supabase download error:', dlError.message);
  } else {
     console.log('Supabase download success, size:', dlData.size);
  }
}

checkCloud();
