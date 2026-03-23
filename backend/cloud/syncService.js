/**
 * syncService.js - Stub service for local development
 * In production this would sync to Supabase or Firebase.
 * For local SQLite usage, this is a no-op.
 */

const syncService = {
  syncRecord: (table, record, keyField) => {
    // No-op for local development
  },
  syncDelete: (table, keyField, keyValue) => {
    // No-op for local development
  },
  syncBulk: (table, records, keyFields) => {
    // No-op for local development
  }
};

module.exports = syncService;
