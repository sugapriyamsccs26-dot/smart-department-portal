/**
 * 🚀 SMART DEPARTMENT PORTAL - FULL MIGRATION SCRIPT (Using firebaseNode.js)
 * Local SQLite (portal.db) -> Cloud Firestore
 * 
 * This script reads ALL data from your local system and stores it in the cloud.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 1. PATHS
const DB_PATH = path.join(__dirname, '../portal.db');
const FIREBASE_CONFIG_PATH = path.join(__dirname, '../config/firebaseNode.js');

if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ SQLite Database not found at: ${DB_PATH}`);
    process.exit(1);
}

// 2. INITIALIZE FIREBASE (Using existing bulletproof config)
console.log('☁️ Connecting to Cloud Firestore via firebaseNode.js...');
const { db: firestore, isFirebaseConfigured } = require(FIREBASE_CONFIG_PATH);

if (!isFirebaseConfigured) {
    console.error('❌ Failed to initialize Firebase using config/firebaseNode.js. Please check your credentials.');
    process.exit(1);
}

const sqlite = new Database(DB_PATH);

// 3. TABLES TO MIGRATE
const TABLES = [
    'users',
    'students',
    'staff',
    'staff_details',
    'staff_documents',
    'attendance',
    'study_materials',
    'assignments',
    'assignment_submissions',
    'marks',
    'exam_marks',
    'timetable',
    'notices',
    'events',
    'event_registrations',
    'placements',
    'alumni',
    'feedback',
    'class_students',
    'class_attendance',
    'substitutions',
    'notifications'
];

// 4. MIGRATION LOGIC
async function migrateTable(tableName) {
    console.log(`📦 Migrating Table: ${tableName}...`);
    
    // Check if table exists in SQLite
    const tableCheck = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
    if (!tableCheck) {
        console.warn(`⚠️  Table "${tableName}" does not exist in SQLite. Skipping.`);
        return;
    }

    const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
    if (rows.length === 0) {
        console.log(`ℹ️  Table "${tableName}" is empty. Skipping.`);
        return;
    }

    console.log(`   Found ${rows.length} records.`);

    // Push to Firestore in batches
    const collectionRef = firestore.collection(tableName);
    let batch = firestore.batch();
    let count = 0;
    let totalMigrated = 0;

    for (const row of rows) {
        // Use a document ID if possible (e.g. from 'id' or 'user_id' or 'reg_no')
        let docRef;
        if (tableName === 'users' && row.user_id) {
            docRef = collectionRef.doc(row.user_id);
        } else if (row.id) {
            docRef = collectionRef.doc(row.id.toString());
        } else {
            docRef = collectionRef.doc();
        }

        // Clean up data for Firestore (remove potential undefined)
        const cleanRow = {};
        for (const [key, val] of Object.entries(row)) {
            if (val !== undefined && val !== null) {
                cleanRow[key] = val;
            }
        }

        batch.set(docRef, cleanRow);
        count++;
        totalMigrated++;

        if (count >= 400) {
            await batch.commit();
            batch = firestore.batch();
            count = 0;
            console.log(`   ... Progress: ${totalMigrated}/${rows.length}`);
        }
    }

    if (count > 0) {
        await batch.commit();
    }

    console.log(`✅ Table "${tableName}" migrated successfully! (${totalMigrated} docs)\n`);
}

async function startMigration() {
    console.log('🚀 Starting Full Migration from Local to Cloud...\n');
    
    for (const table of TABLES) {
        try {
            await migrateTable(table);
        } catch (err) {
            console.error(`❌ Error migrating table "${table}":`, err.message);
        }
    }

    console.log('🎉 ALL DATA STORED IN CLOUD SUCCESSFULLY!');
    process.exit(0);
}

startMigration();
