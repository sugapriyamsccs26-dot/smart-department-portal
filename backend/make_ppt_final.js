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
  const count = items.length;
  const spacing = count > 6 ? 0.45 : 0.52;
  const height = count > 6 ? 0.38 : 0.42;
  items.forEach((item, i) => {
    const y = 1.0 + i * spacing;
    s.addShape(pptx.ShapeType.rect, { x: 0.3, y: y, w: 9.2, h: height, fill: { color: CARD }, line: { color: ACCENT, width: 1 } });
    s.addText(item, { x: 0.55, y: y + 0.06, w: 8.8, fontSize: count > 6 ? 10.5 : 12, color: WHITE });
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
cover.addText('React.js  ·  Node.js  ·  SQLite  ·  Supabase  ·  Vercel  ·  Render', { x: 0.5, y: 2.75, w: 9, fontSize: 11, color: MUTED, align: 'center' });
cover.addText('Bharathidasan University — Dept. of CS & Engineering', { x: 0.5, y: 3.5, w: 9, fontSize: 12, color: MUTED, align: 'center' });
cover.addText('2024 – 2026', { x: 0.5, y: 3.85, w: 9, fontSize: 12, color: ACCENT, align: 'center', bold: true });

// ─── SLIDE 2: Abstract ─────────────────────────────────────────────
titleSlide('Abstract', 'Project Overview');
sectionSlide('Abstract', [
  '📌  A full-stack cloud-enabled academic management system for PG departments (MSc CS, MCA, MTech)',
  '🎯  Digitalises attendance, marks, materials, assignments, notices, events, placements & analytics',
  '⚙️  Built with React.js frontend + Node.js/Express backend + SQLite relational database',
  '☁️  Deployed on Vercel (frontend) and Render (backend) with Supabase cloud infrastructure',
  '🔐  JWT-based stateless authentication with 3-role RBAC: Admin, Staff, Student',
  '📍  Key innovation: Geo-fenced staff attendance, auto mark computation, at-risk analytics',
]);

// ─── SLIDE 3: Problem Statement ────────────────────────────────────
sectionSlide('Problem Statement', [
  '❌  Manual Process: Data managed via registers — inconsistent, inaccessible, and prone to damage',
  '❌  Communication Gap: No real-time link between staff, students, and administration',
  '❌  Calculation Errors: Manual mark/CGPA calculation leads to errors and slow results',
  '❌  Isolation: Staff laptops contain offline marks, students cannot track progress in real-time',
  '❌  Lack of Analytics: No early warning system for failing students or attendance shortage',
]);

// ─── SLIDE 4: Existing vs Proposed (NEW) ──────────────────────────
twoColSlide(
  'Existing vs Proposed System',
  {
    title: '❌ Existing System',
    items: ['Manual paper attendance registers', 'Offline Excel files for marks', 'Physical notice boards', 'Printed project reports only', 'Manual CGPA calculations', 'No student performance charts']
  },
  {
    title: '✅ Proposed System',
    items: ['Cloud-based real-time attendance', 'Online portal for instant marks', 'Digital Notice Board with PDF', 'Geo-fenced staff check-in', 'Auto Grade & CGPA computation', 'Advanced Charts & Analytics']
  }
);

// ─── SLIDE 5: Technology Stack ────────────────────────────────────
twoColSlide(
  'Technology Stack',
  {
    title: '🖥️ Frontend',
    items: ['React.js (Vite)', 'React Router v6', 'Vanilla CSS (Dark UI)', 'Fetch API / Axios', 'Geolocation API']
  },
  {
    title: '⚙️ Backend & Database',
    items: ['Node.js + Express.js', 'SQLite (Primary Database)', 'Supabase (Cloud Storage/DB)', 'JWT + Bcrypt Security', 'Multer File Handler']
  }
);

// ─── SLIDE 6: Architecture ──────────────────────────────────────────
sectionSlide('System Architecture', [
  '🌐  Frontend: Hosted on Vercel (https://sdportal-pi.vercel.app)',
  '🔗  Backend: Hosted on Render (https://smart-department-portal.onrender.com)',
  '🗄️  Database: Local SQLite file (portal.db) synced to Supabase PostgreSQL',
  '📂  Storage: Files stored in Supabase Storage buckets (PDF/PPT/DOCX)',
  '🛡️  Security: CORS origin whitelist + JWT auth middleware',
  '🚀  Workflow: GitHub Push → Auto Deployment → Live Updates',
]);

// ─── SLIDE 7: Module Overview ──────────────────────────────────────
twoColSlide(
  'Module Overview (17 Modules)',
  {
    title: '📚 Academic Support',
    items: ['Authentication & Security', 'User Management', 'Attendance Marking', 'Marks & Assessment', 'Study Materials', 'Assignment Tracker', 'Timetable Management']
  },
  {
    title: '📊 Monitoring & Value Add',
    items: ['Analytics & Charts', 'At-Risk Detection', 'Staff Geo-attendance', 'Placement Portal', 'Alumni Network', 'Feedback System', 'Notice Board & Events']
  }
);

// ─── SLIDE 8: Auth & Security ──────────────────────────────────────
sectionSlide('Security & Authentication', [
  '🔐  JWT (JSON Web Token) for stateless, secure session management',
  '🔑  Password Hashing: Using bcrypt with cost factor 12 (Industry Standard)',
  '🚦  RBAC: Access restricted by roles (Admin / Staff / Student)',
  '👁️  User Experience: Password eye toggle for secure password entry',
  '⏳  Auto-Logout: JWT expiry checks prevent unauthorized session reuse',
]);

// ─── SLIDE 9: Attendance & Geo-fencing ────────────────────────────
twoColSlide(
  'Attendance & Geo-Fencing',
  {
    title: '📋 Student Attendance',
    items: ['Subject-wise marking', 'Monthly percentage tracking', '< 75% shortage alerts', 'Bulk marking feature']
  },
  {
    title: '📍 Staff Geo-Fence',
    items: ['Kajamalai Campus Geofence', '300m radius check', 'Automatic check-in/out log', 'Location verification']
  }
);

// ─── SLIDE 10: Marks & Assessment ──────────────────────────────────
sectionSlide('Marks & Assessment', [
  '🧮  Automated calculation: Internal 1 + Internal 2 + Model → Total Internals',
  '⚖️  Weightage: Automatic merging of internal and semester (external) marks',
  '🏅  Auto-Grading: Conversion of total marks to O, A+, A, B+, B, F grades',
  '📊  CGPA: Real-time calculation based on credits across all semesters',
  '🎯  Transparency: Students see their graded marksheet instantly on portlet',
]);

// ─── SLIDE 11: Materials & Assignments ────────────────────────────
sectionSlide('Academic Resources', [
  '📚  Study Materials: Category-wise filtering (Notes, Lab, QP, Syllabus)',
  '☁️  Cloud Storage: PDFs/PPTs stored in Supabase (No local file loss)',
  '📝  Assignments: Staff set deadlines; Students upload PDF/ZIP',
  '⏲️  Limits: Staff restricted to 2 assignments/month for load management',
  '📂  Document Vault: Personal academic document storage for every user',
]);

// ─── SLIDE 12: Analytics ──────────────────────────────────────────
sectionSlide('Analytics & At-Risk Detection', [
  '📈  Data Visualisation: Attendance bars and CGPA ring charts',
  '⚠️  Early Warning: Automatic flagging of "At-Risk" students (Attendance < 75%)',
  '📉  Performance Analysis: Subject-wise average class performance charts',
  '🚨  "Need Classes" Calculator: Shows student how many classes to attend next',
]);

// ─── SLIDE 13: Notices, Events, Timetable ─────────────────────────
sectionSlide('Communication & Schedule', [
  '📢  Notice Board: Digital board with file attachments (General / Academic / Placements)',
  '📅  Events: Department-wise event listing with online registration',
  '🗓️  Timetable: Dynamic weekly schedule; staff can view their teaching load',
  '🔄  Real-time: All notices and timetables are cloud-synced for instant access',
]);

// ─── SLIDE 14: Career & Feedback ──────────────────────────────────
twoColSlide(
  'Career & Quality Control',
  {
    title: '💼 Corporate/Career',
    items: ['Placement drive listings', 'Internship opportunities', 'Mentorship from alumni', 'LinkedIn connectivity']
  },
  {
    title: '⭐ Quality Feedback',
    items: ['1-5 star course feedback', 'Faculty evaluation', 'Department infrastructure feedback', 'Anonymous/Named submission']
  }
);

// ─── SLIDE 15: Advanced Future Scope (NEW) ────────────────────────
sectionSlide('🔮 Advanced Future Scope', [
  '🤖  AI Performance Predictor: ML model to predict final grades early',
  '🤳  Face Recognition Attendance: AI-based face scan to prevent proxy',
  '💬  WhatsApp Bot: Instant attendance/marks alerts to parents automatically',
  '🔗  Blockchain Certificates: Secure tam-proof degree certificates',
  '📱  Native Mobile App: iOS/Android app with offline-first support',
]);

// ─── SLIDE 16: Conclusion ─────────────────────────────────────────
const finish = pptx.addSlide();
finish.background = { color: BG };
finish.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: ACCENT2 } });
finish.addShape(pptx.ShapeType.rect, { x: 0, y: 4.92, w: '100%', h: 0.08, fill: { color: ACCENT } });
finish.addText('Summary & Conclusion', { x: 0.5, y: 0.3, w: 9, fontSize: 24, color: ACCENT2, bold: true, align: 'center' });
finish.addShape(pptx.ShapeType.rect, { x: 2.5, y: 0.72, w: 5, h: 0.03, fill: { color: ACCENT } });

const sumBullets = [
  '✅  End-to-end digital transformation of department management',
  '✅  Relational Data Accuracy: 100% automated CGPA & Grade calculation',
  '✅  Transparency: Real-time access for staff, students and admin',
  '✅  Scalability: Can be extended to all departments in the university',
  '✅  Cloud Ready: Fully deployed and live on Render/Vercel platform',
];
sumBullets.forEach((b, i) => {
  finish.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.0 + i * 0.55, w: 9.2, h: 0.45, fill: { color: '#0d2b1e' }, line: { color: ACCENT2, width: 1 } });
  finish.addText(b, { x: 0.6, y: 1.07 + i * 0.55, w: 8.9, fontSize: 13, color: WHITE });
});
finish.addText('Q & A | Thank You!', { x: 0.5, y: 4.5, w: 9, fontSize: 18, color: ACCENT, bold: true, align: 'center' });

// Save
pptx.writeFile({ fileName: 'Smart_Department_Portal_Final.pptx' })
  .then(() => console.log('✅  Updated PPT saved: Smart_Department_Portal_Final.pptx'))
  .catch(e => console.error(e));
