const db = require('./backend/db');
const syncService = require('./backend/cloud/syncService');

async function debugAlumni() {
    try {
        let rows = db.prepare(`SELECT * FROM alumni`).all();
        console.log(`Row count: ${rows.length}`);
        if (rows.length > 0) {
            rows = rows.map(r => {
                const { current_role, ...rest } = r;
                return { ...rest, user_role: current_role };
            });
            console.log('Sample row:', rows[0]);
            const { error } = await syncService.supabase
                .from('alumni')
                .upsert(rows, { onConflict: 'id' });
            
            if (error) {
                console.error('ALUMNI SYNC ERROR:', error);
            } else {
                console.log('ALUMNI SYNC SUCCESS');
            }
        }
    } catch (err) {
        console.error('DEBUG ERROR:', err);
    }
    process.exit(0);
}

debugAlumni();
