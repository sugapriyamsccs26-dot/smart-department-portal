const db = require('./db');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function debugAlumni() {
    try {
        let rows = db.prepare(`SELECT * FROM alumni`).all();
        console.log(`Row count: ${rows.length}`);
        if (rows.length > 0) {
            const transformed = rows.map(r => {
                const { current_role, ...rest } = r;
                return { ...rest, user_role: current_role };
            });
            console.log('Sample row:', transformed[0]);
            const { error, data } = await supabase
                .from('alumni')
                .upsert(transformed, { onConflict: 'id' });
            
            if (error) {
                console.error('ALUMNI SYNC ERROR:', JSON.stringify(error, null, 2));
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
