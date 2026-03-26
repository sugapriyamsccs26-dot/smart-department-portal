/**
 * Sync Service - Multi-Cloud Persistence Layer
 * Automatically keeps cloud databases (Supabase & Firebase) in sync with local SQL changes
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Supabase Setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Firebase Setup (load it safely)
let firestore = null;
try {
  const fb = require('../config/firebaseNode');
  if (fb.isFirebaseConfigured) firestore = fb.db;
} catch (e) {
  console.warn('⚠️ Firebase initialization skipped in syncService:', e.message);
}

const syncService = {
  /**
   * Sync a single record to the cloud (Upsert)
   */
  async syncRecord(table, record, conflictColumn = 'id') {
    let supabaseSuccess = false;
    let firebaseSuccess = false;

    try {
      // 1. Sync to Supabase
      const { error } = await supabase
        .from(table)
        .upsert(record, { onConflict: conflictColumn });
      
      if (error) console.error(`☁️ Supabase Sync Error [${table}]:`, error.message);
      else supabaseSuccess = true;

      // 2. Sync to Firebase Firestore
      if (firestore) {
        let docId = record.id ? String(record.id) : null;
        
        // If no ID, generate a deterministic ID from conflict columns (for marks, attendance, etc.)
        if (!docId && conflictColumn !== 'id') {
          const keys = conflictColumn.split(',').map(k => k.trim());
          docId = keys.map(k => record[k]).join('_');
        }

        if (docId) {
          await firestore.collection(table).doc(docId).set(record, { merge: true });
        } else {
          await firestore.collection(table).add(record);
        }
        firebaseSuccess = true;
      }

      return supabaseSuccess || firebaseSuccess;
    } catch (err) {
      console.error(`☁️ Global Sync Error [${table}]:`, err.message);
      return false;
    }
  },

  /**
   * Sync a record deletion to the cloud
   */
  async syncDelete(table, idColumn, idValue) {
    try {
      // 1. Delete from Supabase
      if (idValue === '*') {
        const { error } = await supabase.from(table).delete().neq(idColumn, -1); // Deletes all
        if (error) console.error(`☁️ Supabase Bulk Delete Sync Error [${table}]:`, error.message);
      } else {
        const { error } = await supabase.from(table).delete().eq(idColumn, idValue);
        if (error) console.error(`☁️ Supabase Delete Sync Error [${table}]:`, error.message);
      }

      // 2. Delete from Firebase
      if (firestore) {
        if (idValue === '*') {
          const snap = await firestore.collection(table).get();
          const batch = firestore.batch();
          snap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        } else if (idColumn === 'id') {
          await firestore.collection(table).doc(String(idValue)).delete();
        } else {
          // Find by field and delete
          const snap = await firestore.collection(table).where(idColumn, '==', String(idValue)).get();
          const batch = firestore.batch();
          snap.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
      }

      return true;
    } catch (err) {
      console.error(`☁️ Global Delete Sync Error [${table}]:`, err.message);
      return false;
    }
  },

  /**
   * Sync multiple records in bulk (useful for migrations/seeds)
   */
  async syncBulk(table, records, conflictColumn = 'id') {
    try {
      // 1. Supabase Bulk Upsert
      const { error } = await supabase
        .from(table)
        .upsert(records, { onConflict: conflictColumn });
      
      if (error) console.error(`☁️ Supabase Bulk Sync Error [${table}]:`, error.message);

      // 2. Firebase Bulk Upsert (Firestore batches have 500 limit)
      if (firestore) {
        const CHUNK_SIZE = 450;
        for (let i = 0; i < records.length; i += CHUNK_SIZE) {
          const chunk = records.slice(i, i + CHUNK_SIZE);
          const batch = firestore.batch();
          
          chunk.forEach(record => {
            let docId = record.id ? String(record.id) : null;
            if (!docId && conflictColumn !== 'id') {
              const keys = conflictColumn.split(',').map(k => k.trim());
              docId = keys.map(k => record[k]).join('_');
            }
            const ref = docId ? firestore.collection(table).doc(docId) : firestore.collection(table).doc();
            batch.set(ref, record, { merge: true });
          });
          
          await batch.commit();
        }
      }

      return true;
    } catch (err) {
      console.error(`☁️ Global Bulk Sync Error [${table}]:`, err.message);
      return false;
    }
  }
};

module.exports = syncService;

