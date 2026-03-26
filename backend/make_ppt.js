const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();

// Theme Colors
const BG = '#0f1117';
const ACCENT = '#6c63ff';
const ACCENT2 = '#00d4aa';
const WHITE = '#ffffff';
const MUTED = '#a0aec0';
const CARD = '#1a1d2e';

function titleSlide(title, subtitle) {
  const s = pptx.addSlide();
  s.background = { color: BG };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 2.5, w: '100%', h: 0.04, fill: { color: ACCENT } });
  s.addText('SMART DEPARTMENT PORTAL', { x: 0.5, y: 0.4, w: 9, fontSize: 11, color: ACCENT2, bold: true, charSpacing: 4 });
  s.addText(title, { x: 0.5, y: 0.9, w: 9, fontSize: 32, color: WHITE, bold: true, breakLine: false });
  s.addText(subtitle, { x: 0.5, y: 2.0, w: 9, fontSize: 14, color: MUTED });
  s.addText('Department of Computer Science | Bharathidasan University | 2024–2026', { x: 0.5, y: 4.8, w: 9, fontSize: 10, color: MUTED, align: 'center' });
}

function sectionSlide(title, items) {
  const s = pptx.addSlide();
  s.background = { color: BG };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: '100%', fill: { color: ACCENT } });
  s.addText(title, { x: 0.3, y: 0.25, w: 9.2, fontSize: 22, color: ACCENT2, bold: true });
  s.addShape(pptx.ShapeType.rect, { x: 0.3, y: 0.75, w: 9.2, h: 0.03, fill: { color: ACCENT } });
  items.forEach((item, i) => {
    const y = 1.0 + i * 0.52;
    s.addShape(pptx.ShapeType.rect, { x: 0.3, y: y, w: 9.2, h: 0.42, fill: { color: CARD }, line: { color: ACCENT, width: 1 } });
    s.addText(item, { x: 0.55, y: y + 0.06, w: 8.8, fontSize: 12, color: WHITE });
  });
}

function twoColSlide(title, left, right) {
  const s = pptx.addSlide();
  s.background = { color: BG };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: '100%', fill: { color: ACCENT } });
  s.addText(title, { x: 0.3, y: 0.25, w: 9.2, fontSize: 22, color: ACCENT2, bold: true });
  s.addShape(pptx.ShapeType.rect, { x: 0.3, y: 0.75, w: 9.2, h: 0.03, fill: { color: ACCENT } });
  // Left col
  s.addShape(pptx.ShapeType.rect, { x: 0.3, y: 0.95, w: 4.4, h: 3.8, fill: { color: CARD }, line: { color: ACCENT, width: 1 } });
  s.addText(left.title, { x: 0.45, y: 1.05, w: 4.1, fontSize: 13, color: ACCENT2, bold: true });
  left.items.forEach((t, i) => s.addText('▸  ' + t, { x: 0.45, y: 1.45 + i * 0.38, w: 4.1, fontSize: 11, color: WHITE }));
  // Right col
  s.addShape(pptx.ShapeType.rect, { x: 5.1, y: 0.95, w: 4.4, h: 3.8, fill: { color: CARD }, line: { color: ACCENT2, width: 1 } });
  s.addText(right.title, { x: 5.25, y: 1.05, w: 4.1, fontSize: 13, color: ACCENT, bold: true });
  right.items.forEach((t, i) => s.addText('▸  ' + t, { x: 5.25, y: 1.45 + i * 0.38, w: 4.1, fontSize: 11, color: WHITE }));
}

// ─── SLIDE 1: Cover ───────────────────────────────────────────────
const cover = pptx.addSlide();
cover.background = { color: BG };
cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: ACCENT } });
cover.addShape(pptx.ShapeType.rect, { x: 0, y: 4.92, w: '100%', h: 0.08, fill: { color: ACCENT2 } });
cover.addText('🎓', { x: 4.0, y: 0.4, w: 2, fontSize: 48, align: 'center' });
cover.addText('SMART DEPARTMENT PORTAL', { x: 0.5, y: 1.4, w: 9, fontSize: 28, color: WHITE, bold: true, align: 'center' });
cover.addText('A Cloud-Enabled Academic Management System', { x: 0.5, y: 2.1, w: 9, fontSize: 15, color: ACCENT2, align: 'center' });
cover.addShape(pptx.ShapeType.rect, { x: 2, y: 2.6, w: 6, h: 0.03, fill: { color: ACCENT } });
cover.addText('React.js  ·  Node.js  ·  SQLite  ·  Firebase  ·  Supabase  ·  Vercel  ·  Render', { x: 0.5, y: 2.75, w: 9, fontSize: 11, color: MUTED, align: 'center' });
cover.addText('Bharathidasan University — Dept. of CS & Engineering', { x: 0.5, y: 3.5, w: 9, fontSize: 12, color: MUTED, align: 'center' });
cover.addText('2024 – 2026', { x: 0.5, y: 3.85, w: 9, fontSize: 12, color: ACCENT, align: 'center', bold: true });

// ─── SLIDE 2: Abstract ─────────────────────────────────────────────
titleSlide('Abstract', 'Project Overview');
sectionSlide('Abstract', [
  '📌  A full-stack cloud-enabled academic management system for PG departments (MSc CS, AI & DS, MCA, MTech CS)',
  '🎯  Digitalises attendance, marks, materials, assignments, notices, events, placements & analytics',
  '⚙️  Built with React.js frontend + Node.js/Express backend + SQLite database',
  '☁️  Deployed on Vercel (frontend) and Render (backend) with Firebase & Supabase cloud sync',
  '🔐  JWT-based stateless authentication with 3-role RBAC: Admin, Staff, Student',
  '📍  Key innovation: Geo-fenced staff attendance, auto mark computation, at-risk analytics',
]);

// ─── SLIDE 3: Problem & Objectives ────────────────────────────────
sectionSlide('Problem Statement & Objectives', [
  '❌  Problem: Data managed via registers/spreadsheets — inconsistent, inaccessible, error-prone',
  '❌  No real-time communication between staff and students',
  '❌  Manual mark calculation leads to errors; no early warning for failing students',
  '✅  Objective: Build a single unified cloud portal for the entire department workflow',
  '✅  Objective: Role-based access so each user sees only what is relevant to them',
  '✅  Objective: Provide powerful analytics and at-risk student detection for staff/admin',
]);

// ─── SLIDE 4: Technology Stack ────────────────────────────────────
twoColSlide(
  'Technology Stack',
  {
    title: '🖥️ Frontend',
    items: ['React.js (Vite build tool)', 'React Router v6 (SPA routing)', 'Vanilla CSS (dark design system)', 'Fetch API for REST calls', 'Browser Geolocation API']
  },
  {
    title: '⚙️ Backend & Database',
    items: ['Node.js + Express.js REST API', 'SQLite (better-sqlite3) — primary DB', 'Firebase Firestore — cloud real-time DB', 'Supabase PostgreSQL + Storage', 'JWT authentication + bcryptjs']
  }
);

// ─── SLIDE 5: System Architecture ──────────────────────────────────
sectionSlide('System Architecture & Deployment', [
  '🌐  User Browser → Vercel CDN → React.js SPA (https://sdportal-pi.vercel.app)',
  '🔗  React SPA → HTTPS REST calls → Render Node.js Backend (https://smart-department-portal.onrender.com)',
  '🗄️  Node.js Backend → SQLite (primary DB) + Supabase PostgreSQL (cloud sync)',
  '📂  File Uploads → Multer (local /uploads/) → mirrored to Supabase Storage Bucket',
  '🔥  Production queries → Firebase Firestore for real-time data access',
  '🚀  CI/CD: GitHub push → auto-redeploy on both Vercel and Render',
]);

// ─── SLIDE 6: Module Overview ──────────────────────────────────────
twoColSlide(
  'Module Overview (17 Modules)',
  {
    title: '📚 Core Academic Modules',
    items: ['1. Authentication & Security', '2. User & Student Management', '3. Attendance Management', '4. Staff Geo-Fenced Attendance', '5. Marks & Assessment', '6. Study Materials', '7. Assignments']
  },
  {
    title: '🌟 Extended Modules',
    items: ['8. Notice Board', '9. Events Management', '10. Timetable', '11. Placements', '12. Alumni Network', '13. Feedback System', '14. Analytics & At-Risk', '15–17. Notifications, Profile, Cloud Sync']
  }
);

// ─── SLIDE 7: Authentication & RBAC ───────────────────────────────
sectionSlide('Module 1 — Authentication & Security', [
  '🔐  JWT (JSON Web Token) stateless authentication — token stored in localStorage',
  '🔑  On login: server verifies email + bcrypt password, issues a signed JWT token',
  '🛡️  Every API call sends "Authorization: Bearer <token>" header to the backend',
  '👁️  Password eye-toggle on login form (show/hide password)',
  '🚦  RBAC Middleware: every route declares allowed roles [admin] [staff] [student]',
  '⏰  Session expiry auto-logs user out and redirects to login with alert message',
]);

// ─── SLIDE 8: Attendance & Geo-Fencing ───────────────────────────
twoColSlide(
  'Module 3 & 4 — Attendance Management',
  {
    title: '📋 Student Attendance',
    items: ['Staff mark per course + per date', 'Statuses: Present / Absent / Late / Excused', 'Students view their own % per course', 'Shortage alert for < 75% attendance', 'Bulk marking for full class at once', '"Need X more classes" calculator shown']
  },
  {
    title: '📍 Staff Geo-Fenced Attendance',
    items: ['Browser Geolocation API used', 'Campus centre: Kajamalai, Trichy', '300-metre geo-fence radius enforced', 'Outside campus = check-in rejected', 'Check-in / check-out time recorded', 'Admin views full staff daily log']
  }
);

// ─── SLIDE 9: Marks & Assessment ──────────────────────────────────
sectionSlide('Module 5 — Marks & Assessment Management', [
  '📝  Supports 4 exam types: Internal 1, Internal 2, Model Exam, Semester',
  '🧮  Internal marks auto-computed from Internal 1 + Internal 2 + Model Exam scores',
  '📊  Total = Internal Marks + External (Semester) Marks',
  '🏅  Grade computation: O (≥90), A+ (≥80), A (≥70), B+ (≥60), B (≥50), F (<50)',
  '📈  CGPA calculated across all courses — displayed as a ring chart in student profile',
  '🔄  Marks synced to Supabase and Firestore for cloud-wide access',
]);

// ─── SLIDE 10: Study Materials & Assignments ──────────────────────
twoColSlide(
  'Module 6 & 7 — Materials & Assignments',
  {
    title: '📚 Study Materials',
    items: ['Types: Notes, PPT, Lab Manual, QP, Syllabus', 'Formats: PDF, PPTX, DOCX, ZIP (max 400MB)', 'Files stored locally + mirrored to Supabase', 'Filter by type and program', 'Download links work on local & cloud']
  },
  {
    title: '📝 Assignments',
    items: ['Staff create with title, course, deadline', 'Staff limited to 2 assignments/month', 'Students upload submission (any file type)', 'Staff view all submissions + download', 'Admin can bulk-delete all assignments']
  }
);

// ─── SLIDE 11: Notices, Events, Timetable ─────────────────────────
sectionSlide('Module 8, 9, 10 — Notices, Events & Timetable', [
  '📢  Notice Board: Post notices with category (general/academic/exam/placement/event) + optional PDF',
  '📅  Events: Admin creates events with venue, date, type; students/staff register online',
  '🗓️  Timetable: Weekly grid view per program & semester (course, room, staff assignment)',
  '🔥  Timetable synced to Firebase Firestore for real-time cloud access',
  '🎨  Colour-coded categories for quick visual identification on notice board',
  '🔔  Event registration count shown live on every event card',
]);

// ─── SLIDE 12: Analytics & At-Risk ───────────────────────────────
sectionSlide('Module 14 — Analytics & At-Risk Detection', [
  '📊  Admin/Staff view class-wide attendance and marks analytics with charts',
  '⚠️  At-Risk Detection: Students with < 75% attendance automatically flagged',
  '📈  CGPA distribution chart, subject-wise performance analysis',
  '👤  Individual student analytics: per-course attendance bars + marks table',
  '🔢  Dashboard quick stats: total students, average attendance, at-risk count',
  '💡  "Need X more classes" warning shown per course to alert students early',
]);

// ─── SLIDE 13: Placements, Alumni, Feedback ───────────────────────
sectionSlide('Module 11, 12, 13 — Placements, Alumni & Feedback', [
  '💼  Placements: Admin posts job/internship drives (company, role, package, deadline, apply link)',
  '🎓  Alumni Network: Alumni register with current company, role, LinkedIn, mentorship availability',
  '🤝  Students can browse alumni and connect via LinkedIn for career guidance',
  '⭐  Feedback: Students rate courses, faculty, department (1–5 stars + comments)',
  '📋  Staff and Admin view aggregated feedback reports to improve quality',
  '🔔  Notifications: In-app bell icon shows unread count; mark-as-read supported',
]);

// ─── SLIDE 14: Security & Cloud Sync ─────────────────────────────
twoColSlide(
  'Security & Cloud Sync Architecture',
  {
    title: '🔒 Security Features',
    items: ['JWT Auth — all routes protected', 'Bcrypt hashing (cost factor 12)', 'RBAC middleware on every API route', 'CORS whitelist (localhost + Vercel)', 'File type validation via Multer', 'All secrets in .env (not in Git)']
  },
  {
    title: '☁️ Cloud Sync Layer',
    items: ['SQLite write → Supabase sync (background)', 'Uploaded files → Supabase Storage bucket', 'Firebase Firestore for production queries', 'portal.db copied to /tmp on Render boot', 'GitHub push → auto CI/CD redeploy', 'Supabase PostgreSQL as backup DB']
  }
);

// ─── SLIDE 15: Conclusion ─────────────────────────────────────────
const last = pptx.addSlide();
last.background = { color: BG };
last.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: ACCENT2 } });
last.addShape(pptx.ShapeType.rect, { x: 0, y: 4.92, w: '100%', h: 0.08, fill: { color: ACCENT } });
last.addText('Conclusion & Future Scope', { x: 0.5, y: 0.3, w: 9, fontSize: 24, color: ACCENT2, bold: true, align: 'center' });
last.addShape(pptx.ShapeType.rect, { x: 2.5, y: 0.72, w: 5, h: 0.03, fill: { color: ACCENT } });

const bullets = [
  '✅  Successfully built a full-stack cloud-deployed academic portal',
  '✅  17 modules covering the complete department workflow',
  '✅  Real geo-fenced attendance, auto-mark computation & at-risk analytics',
  '✅  Secure JWT auth with RBAC — 3 roles: Admin, Staff, Student',
  '✅  Live on Vercel + Render with GitHub CI/CD pipeline',
  '🔮  Future: Mobile app (React Native), AI-based grade prediction',
  '🔮  Future: WhatsApp/SMS notification integration for student alerts',
];
bullets.forEach((b, i) => {
  last.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.0 + i * 0.5, w: 9.2, h: 0.42, fill: { color: i < 5 ? '#0d2b1e' : '#1a1225' }, line: { color: i < 5 ? ACCENT2 : ACCENT, width: 1 } });
  last.addText(b, { x: 0.6, y: 1.07 + i * 0.5, w: 8.9, fontSize: 12, color: WHITE });
});
last.addText('Thank You!', { x: 0.5, y: 4.55, w: 9, fontSize: 18, color: ACCENT, bold: true, align: 'center' });

// Save
pptx.writeFile({ fileName: 'Smart_Department_Portal.pptx' })
  .then(() => console.log('✅  PPT saved: Smart_Department_Portal.pptx'))
  .catch(e => console.error(e));
