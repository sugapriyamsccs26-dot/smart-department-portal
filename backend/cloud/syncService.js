/**
 * Sync Service - Supabase Persistence Layer
 * Automatically keeps cloud database in sync with local SQL changes
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const syncService = {
  /**
   * Sync a single record to the cloud (Upsert)
   */
  async syncRecord(table, record, conflictColumn = 'id') {
    try {
      // Small delay to ensure DB locks are released or for async robustness
      const { error } = await supabase
        .from(table)
        .upsert(record, { onConflict: conflictColumn });
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`☁️ Supabase Sync Error [${table}]:`, err.message);
      return false;
    }
  },

  /**
   * Sync a record deletion to the cloud
   */
  async syncDelete(table, idColumn, idValue) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idColumn, idValue);
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`☁️ Supabase Delete Sync Error [${table}]:`, err.message);
      return false;
    }
  },

  /**
   * Sync multiple records in bulk (useful for migrations/seeds)
   */
  async syncBulk(table, records, conflictColumn = 'id') {
    try {
      const { error } = await supabase
        .from(table)
        .upsert(records, { onConflict: conflictColumn });
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error(`☁️ Supabase Bulk Sync Error [${table}]:`, err.message);
      return false;
    }
  }
};

module.exports = syncService;
