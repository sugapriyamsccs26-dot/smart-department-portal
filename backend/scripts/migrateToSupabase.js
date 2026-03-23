require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const db = require('../db');

// Read Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials in .env");
  process.exit(1);
}

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrateToSupabase() {
  console.log('🚀 Starting Full Migration to Supabase...');
  
  // 1. Read all tables from the local database
  const tablesQuery = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  const tables = tablesQuery.all().map(row => row.name);
  
  console.log(`Found ${tables.length} tables to migrate.`);

  // Load valid users to filter invalid event registrations
  const validUserIds = new Set(db.prepare("SELECT id FROM users").all().map(u => u.id));

  // 2. Iterate and process each table
  for (const table of tables) {
    try {
      let rows = db.prepare(`SELECT * FROM ${table}`).all();
      if (rows.length === 0) {
        console.log(`[${table}] ℹ️ No rows to migrate.`);
        continue;
      }

      // PRE-MIGRATION FIXES

      // Fix 2: timetable table - skip Saturday and Sunday
      if (table === 'timetable') {
        rows = rows.filter(r => r.day !== 'Saturday' && r.day !== 'Sunday');
      }

      // Fix 4: event_registrations - skip rows where user_id does not exist
      if (table === 'event_registrations') {
        rows = rows.filter(r => validUserIds.has(r.user_id));
      }

      // Fix 3: staff_attendance table - creation
      if (table === 'staff_attendance') {
        const createSql = `
CREATE TABLE IF NOT EXISTS staff_attendance (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK(status IN ('present','absent','late')) NOT NULL,
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(staff_id, date)
);`;
        // Attempt an RPC to execute raw SQL (assuming function like exec_sql exists)
        const { error: rpcErr } = await supabase.rpc('exec_sql', { query: createSql });
        if (rpcErr) {
          console.warn(`[${table}] ⚠️ Notice: RPC for table creation failed (You may need to run this SQL manually inside Supabase). Error:`, rpcErr.message);
        } else {
          console.log(`[${table}] ✅ staff_attendance table created/checked successfully via RPC.`);
        }
      }

      console.log(`[${table}] 📦 Found ${rows.length} rows to migrate...`);
      let successCount = 0;
      let errorCount = 0;
      
      // 3. Upsert data in batches of 100
      for (let i = 0; i < rows.length; i += 100) {
        let batch = rows.slice(i, i + 100);

        // Fix 1: alumni table - rename current_role to current_role_title
        if (table === 'alumni') {
          batch = batch.map(row => {
            const newRow = { ...row, current_role_title: row.current_role };
            delete newRow.current_role;
            return newRow;
          });
        }
        
        // Use upsert to prevent unique constraint failures
        const { error } = await supabase.from(table).upsert(batch);
        
        if (error) {
          console.error(`[${table}] ❌ Batch error:`, error.message, error.details || '');
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }
      
      // 4. Log success/failure per table
      if (errorCount > 0) {
        console.log(`[${table}] ⚠️ Result: ${successCount} succeeded, ${errorCount} failed.`);
      } else {
        console.log(`[${table}] ✅ Result: Success (${successCount} rows)`);
      }
      
    } catch (err) {
      console.error(`[${table}] ❌ Error reading or migrating table:`, err.message);
    }
  }
  
  console.log('✨ Database migration process finished!');
  process.exit(0);
}

migrateToSupabase();
