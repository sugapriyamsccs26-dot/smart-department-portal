const db = require('../db');
const syncService = require('./syncService');

/**
 * FULL DATA MIGRATION UTILITY
 * Syncs all existing local SQLite data to Supabase Cloud Database.
 * Run this ONCE after setting up your Supabase project.
 */

async function migrateAll() {
    console.log('🚀 Starting Full Cloud Migration...');

    const tables = [
        { name: 'users', conflict: 'id' },
        { name: 'students', conflict: 'id' },
        { name: 'staff', conflict: 'id' },
        { name: 'staff_details', conflict: 'id' },
        { name: 'attendance', conflict: 'student_id, course_id, date' },
        { name: 'study_materials', conflict: 'id' },
        { name: 'assignments', conflict: 'id' },
        { name: 'assignment_submissions', conflict: 'assignment_id, student_id' },
        { name: 'marks', conflict: 'student_id, course_id, semester' },
        { name: 'exam_marks', conflict: 'student_id, course_id, semester, exam_type' },
        { name: 'timetable', conflict: 'id' },
        { name: 'notices', conflict: 'id' },
        { name: 'events', conflict: 'id' },
        { name: 'event_registrations', conflict: 'event_id, user_id' },
        { name: 'placements', conflict: 'id' },
        { 
            name: 'alumni', 
            conflict: 'id', 
            transform: (r) => { 
                const { current_role, ...rest } = r; 
                return { ...rest, user_role: current_role }; 
            } 
        },
        { name: 'feedback', conflict: 'id' },
        { name: 'class_students', conflict: 'reg_no' },
        { name: 'class_attendance', conflict: 'reg_no, date, subject' },
        { name: 'notifications', conflict: 'id' }
    ];

    for (const table of tables) {
        try {
            console.log(`📦 Syncing table: [${table.name}]...`);
            let rows = db.prepare(`SELECT * FROM ${table.name}`).all();
            
            if (rows.length > 0) {
                if (table.transform) rows = rows.map(table.transform);
                // Supabase upsert has a limit on payload size, so we sync in chunks of 100
                const CHUNK_SIZE = 100;
                for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
                    const chunk = rows.slice(i, i + CHUNK_SIZE);
                    await syncService.syncBulk(table.name, chunk, table.conflict);
                }
                console.log(`✅ Table [${table.name}] synced (${rows.length} rows).`);
            } else {
                console.log(`ℹ️ Table [${table.name}] is empty.`);
            }
        } catch (err) {
            console.error(`❌ Migration failed for [${table.name}]:`, err.message);
        }
    }

    console.log('✨ All migrations complete!');
    process.exit(0);
}

// Check if running directly
if (require.main === module) {
    migrateAll();
}

module.exports = migrateAll;
