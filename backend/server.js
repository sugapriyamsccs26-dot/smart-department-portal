require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Allow all standard origins dynamically (fixes local/cloud CORS issues)
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174', // fallback for some vite runs
      'https://sdportal-pi.vercel.app',
      'https://smart-department-portal.onrender.com'
    ];
    
    // Also allow any vercel.app preview URLs
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '400mb' }));
app.use(express.urlencoded({ limit: '400mb', extended: true }));
const UPLOAD_ROOT = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_ROOT), (req, res, next) => {
  // If express.static didn't find the file, try cloud fallback
  const fileName = req.path.replace(/^\//, '');
  const supabase = require('./cloud/supabaseClient');
  if (supabase && fileName && fileName !== 'test.txt') {
    const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
    if (data && data.publicUrl) {
      console.log(`☁️ Cloud fallback redirect: ${fileName} → ${data.publicUrl}`);
      return res.redirect(data.publicUrl);
    }
  }
  next();
});

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// --- Routes ---
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/students',     require('./routes/students'));
app.use('/api/attendance',   require('./routes/attendance'));
app.use('/api/materials',    require('./routes/materials'));
app.use('/api/events',       require('./routes/events'));
app.use('/api/notices',      require('./routes/notices'));
app.use('/api/marks',        require('./routes/marks'));
app.use('/api/placements',   require('./routes/placements'));
app.use('/api/alumni',       require('./routes/alumni'));
app.use('/api/timetable',    require('./routes/timetable'));
app.use('/api/feedback',     require('./routes/feedback'));
app.use('/api/analytics',    require('./routes/analytics'));
app.use('/api/analytics',    require('./routes/atRisk')); // Registered atRisk route
app.use('/api/assignments',  require('./routes/assignments'));
app.use('/api/notifications', require('./routes/notifications'));
require('./db/staffAttendanceTable');
app.use('/api/staff-attendance', require('./routes/staffAttendance'));

// Health check with diagnostics
app.get('/api/health', async (req, res) => {
    const dbConfig = require('./config/database');
    const fb = require('./config/firebaseNode');
    let firestoreRead = 'Not tested';
    if (fb.isFirebaseConfigured && fb.db) {
       try {
         const testSnap = await fb.db.collection('users').limit(1).get();
         firestoreRead = `Success (Found ${testSnap.size} docs)`;
       } catch (fe) {
         firestoreRead = `Failed: ${fe.message}`;
       }
    }
    res.json({ 
      status: 'online', 
      version: 'v1.1.0', // Updated on Mar 28
      time: new Date(),
      database: {
        isProduction: dbConfig.isProduction,
        isLoaded: !!dbConfig.db,
        mode: dbConfig.isProduction ? 'FIREBASE' : 'SQLITE',
        firebaseStatus: fb.isFirebaseConfigured ? 'READY ✅' : 'NOT CONFIGURED ❌',
        firebaseError: fb.lastError || 'None',
        firestoreRead,
        debugKeyInfo: fb.debugKeyInfo || 'No key info'
      }
    });
});


// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ message: `Endpoint ${req.method} ${req.path} not found.` });
});

// --- Global Error Handler (prevents HTML stack traces from breaking JSON parsers) ---
app.use((err, req, res, next) => {
  console.error('Express Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
