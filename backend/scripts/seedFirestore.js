/**
 * 🔥 FIREBASE FIRESTORE SEED SCRIPT
 * Migrates all local SQLite data → Firestore Collections
 * Run once: node backend/scripts/seedFirestore.js
 */

const path = require('path');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

// Load Firebase Admin
const saPath = path.join(__dirname, '../config/nexusportal-service-key.json');

admin.initializeApp({
  credential: admin.credential.cert(saPath)
});
const db = admin.firestore();


console.log('🔥 Connected to Firestore. Starting seed...\n');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Write a batch of documents without hitting 500-doc batch limit
// ─────────────────────────────────────────────────────────────────────────────
async function batchWrite(collection, docs) {
  let batch = db.batch();
  let count = 0;
  for (const doc of docs) {
    const ref = db.collection(collection).doc();
    batch.set(ref, doc);
    count++;
    if (count % 400 === 0) {   // Firestore batch max = 500
      await batch.commit();
      batch = db.batch();
    }
  }
  if (count % 400 !== 0) await batch.commit();
  console.log(`  ✅ ${collection}: ${docs.length} docs written`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Check and skip if collection already populated
// ─────────────────────────────────────────────────────────────────────────────
async function isAlreadySeeded(collection) {
  const snap = await db.collection(collection).limit(1).get();
  return !snap.empty;
}

async function seed() {
  const hash    = bcrypt.hashSync('Admin@1234', 12);
  const staffPw = bcrypt.hashSync('Staff@1234', 12);
  const stuPw   = bcrypt.hashSync('Student@1234', 12);
  const alumPw  = bcrypt.hashSync('Alumni@1234', 12);

  // ───────────────────────────────
  // 1.  USERS (Admin + Staff + Alumni)
  // ───────────────────────────────
  if (await isAlreadySeeded('users')) {
    console.log('  ⏭  users: already seeded, skipping.');
  } else {
    const users = [
      // Admin / HOD
      { user_id: 'BDU1670884', name: 'Dr. E. George Dharma Prakash Raj', email: 'georgeprakashraj@bdu.ac.in', password_hash: hash,    role: 'admin',   created_at: new Date().toISOString() },
      // Staff
      { user_id: 'BDU1660758',  name: 'Dr. Gopinath Ganapathy',       email: 'gganapathy@bdu.ac.in',      password_hash: staffPw, role: 'staff', created_at: new Date().toISOString() },
      { user_id: 'BDU17010631', name: 'Prof.(Dr.) M. Balamurugan',    email: 'mbala@bdu.ac.in',           password_hash: staffPw, role: 'staff', created_at: new Date().toISOString() },
      { user_id: 'BDU1760794',  name: 'Dr. M. Lalli',                 email: 'lalli@bdu.ac.in',           password_hash: staffPw, role: 'staff', created_at: new Date().toISOString() },
      { user_id: 'BDU1711015',  name: 'Dr. B. Smitha Evelin Zoraida', email: 'smitha.b@bdu.ac.in',        password_hash: staffPw, role: 'staff', created_at: new Date().toISOString() },
      { user_id: 'BDU1721040',  name: 'Dr. M. Durairaj',              email: 'durairaj.m@bdu.ac.in',      password_hash: staffPw, role: 'staff', created_at: new Date().toISOString() },
      { user_id: 'BDU1751033',  name: 'Dr. P. Sumathy',               email: 'sumathy.p@bdu.ac.in',       password_hash: staffPw, role: 'staff', created_at: new Date().toISOString() },
      { user_id: 'BDU1711014',  name: 'Dr. K. Muthuramalingam',       email: 'muthuramalingam@bdu.ac.in', password_hash: staffPw, role: 'staff', created_at: new Date().toISOString() },
      // Alumni
      { user_id: 'ALM2022001', name: 'Priya Subramanian',   email: 'priya.s@alumni.edu',    password_hash: alumPw, role: 'alumni', created_at: new Date().toISOString() },
      { user_id: 'ALM2022002', name: 'Karthik Raja M',      email: 'karthik.r@alumni.edu',  password_hash: alumPw, role: 'alumni', created_at: new Date().toISOString() },
      { user_id: 'ALM2023001', name: 'Divya Bharathi S',    email: 'divya.b@alumni.edu',    password_hash: alumPw, role: 'alumni', created_at: new Date().toISOString() },
      { user_id: 'ALM2023002', name: 'Arun Prasad K',       email: 'arun.p@alumni.edu',     password_hash: alumPw, role: 'alumni', created_at: new Date().toISOString() },
      { user_id: 'ALM2024001', name: 'Nandhini Velmurugan', email: 'nandhini.v@alumni.edu', password_hash: alumPw, role: 'alumni', created_at: new Date().toISOString() },
    ];
    await batchWrite('users', users);
  }

  // ───────────────────────────────
  // 2.  CLASS STUDENTS (all 137)
  // ───────────────────────────────
  if (await isAlreadySeeded('class_students')) {
    console.log('  ⏭  class_students: already seeded, skipping.');
  } else {
    const classStudents = [
      // II MCA
      { reg_no:'24MCA01',name:'ABDUL KALAM AZAD N',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA02',name:'ANBALAGAN K',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA03',name:'AROCKIYA LIGIFEMINA D',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA04',name:'BASKAR P',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA05',name:'BHARANIDHARAN S',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA06',name:'CATHERIN JECINTHA J R',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA07',name:'DHANAM A',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA08',name:'DHANUSHIYA S',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA09',name:'ESWARI N',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA10',name:'HARIHARAN M',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA11',name:'JEEVAN D',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA12',name:'KEERTHANA A',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA13',name:'MADESH C',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA14',name:'MOHAN RAM G',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA15',name:'MUTHULAKSHMI',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA16',name:'NAFEES ASHFAQ AHAMED N',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA17',name:'NANCY B',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA18',name:'NIRUBAN A',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA19',name:'PRAKASH R',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA20',name:'PUNITHA M',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA21',name:'RAGUL C A',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA22',name:'RAHUL S',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA23',name:'RAJESWARI M',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA24',name:'SABARINATHAN S',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA25',name:'SANJAI M',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA26',name:'SANJAY R',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA27',name:'SANTHOSH KUMAR P',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA28',name:'SARAN G',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA29',name:'SIBI GLAXON E',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA30',name:'SRI HARINI S',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA31',name:'STEWARD RIGHTEOUS T',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA32',name:'SUDHARSAN R',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA33',name:'SUMATHI S',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA34',name:'VARSHINI V',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA35',name:'VEERAMANI E',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA36',name:'VENKATESH P',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA37',name:'VIVIN SAMUEL F',program:'MCA',class_name:'II MCA'},
      { reg_no:'24MCA38',name:'YUVASRI R',program:'MCA',class_name:'II MCA'},
      // II MSc CS
      { reg_no:'24MSCCS01',name:'ABINAYA N',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS02',name:'ABIRAMI K',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS03',name:'ABIRAYANA K',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS04',name:'DINESH T',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS05',name:'ESWARI P',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS06',name:'HEMA VESALINI R',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS07',name:'JUVITHA B',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS08',name:'KATHIRESAN P',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS09',name:'KAVIYA S',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS10',name:'KEERTHANA G',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS11',name:'KUMARAGURU S',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS12',name:'MOHAMED JAMAL JUNAITH P',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS13',name:'NAVEENKUMAR V',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS14',name:'RAGAVAMOORTHI K',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS15',name:'RAHUL ROSHAN J',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS16',name:'SOWMIYA S',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS17',name:'SRIHARINI S',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS18',name:'SUGA PRIYA R',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS19',name:'SUNDARESAN J',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS20',name:'VARSHA K',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS21',name:'YAMUNA PRIYA R',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS22',name:'YOGESHWARAN R',program:'MSc CS',class_name:'II MSc CS'},
      { reg_no:'24MSCCS24',name:'RAMYA S',program:'MSc CS',class_name:'II MSc CS'},
      // II MSc DS
      { reg_no:'24MSCDS01',name:'ABI T',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS02',name:'AJAYY KUMAAR K',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS03',name:'CHANDRU K',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS04',name:'DHANAPRIYA D',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS05',name:'DURGA DEVI K',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS06',name:'GIRIDHARAN M',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS07',name:'HARINI S',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS08',name:'JAYANTH R',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS09',name:'MADHAVAN V',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS10',name:'MANIKANDAA S',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS11',name:'MANOJ KUMAR N',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS12',name:'MARIYA JERON ROY A',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS13',name:'MOHAMED IBRAHIM K',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS14',name:'MOHAMED SUHAIL A',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS15',name:'MOHAMMED ABUTHAGHIR A',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS16',name:'NARMATHA R',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS17',name:'NAVEENKUMAR C',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS18',name:'PRITHIV RAJ M',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS19',name:'RIYASKHAN J',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS20',name:'SAKTHY MARY PARVEEN T S',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS22',name:'SHIBIVARSHAN S',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS23',name:'SHIVARAMAKRISHNAN D',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS24',name:'SURYA KUMAR G',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS25',name:'TANISHQ RAJA S G',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS26',name:'YOGESHWARAN M',program:'MSc DS',class_name:'II MSc DS'},
      { reg_no:'24MSCDS27',name:'BUVANA S',program:'MSc DS',class_name:'II MSc DS'},
      // II MSc AI
      { reg_no:'24MSCAI01',name:'DEEPA S',program:'MSc AI',class_name:'II MSc AI'},
      { reg_no:'24MSCAI02',name:'GANESH R',program:'MSc AI',class_name:'II MSc AI'},
      { reg_no:'24MSCAI03',name:'GIRENIVAAS S R',program:'MSc AI',class_name:'II MSc AI'},
      { reg_no:'24MSCAI04',name:'HARISH S',program:'MSc AI',class_name:'II MSc AI'},
      { reg_no:'24MSCAI05',name:'INIGOANAND L',program:'MSc AI',class_name:'II MSc AI'},
      { reg_no:'24MSCAI06',name:'MERLIN CIBYA RANI M',program:'MSc AI',class_name:'II MSc AI'},
      { reg_no:'24MSCAI07',name:'RANJITH KUMAR B',program:'MSc AI',class_name:'II MSc AI'},
      { reg_no:'24MSCAI08',name:'SRIKHANTH R',program:'MSc AI',class_name:'II MSc AI'},
      { reg_no:'24MSCAI09',name:'VIMAL RAJ A',program:'MSc AI',class_name:'II MSc AI'},
      { reg_no:'24MSCAI10',name:'VISHAL MURALI M R',program:'MSc AI',class_name:'II MSc AI'},
      { reg_no:'24MSCAI11',name:'NANTHABALAN',program:'MSc AI',class_name:'II MSc AI'},
      // IV MTech
      { reg_no:'22MTCS01',name:'ADHITYA M R',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS02',name:'AGALYA N',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS03',name:'ANBU SWETHA B',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS04',name:'ANITHA M',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS05',name:'DHAMODHARAN J',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS06',name:'DHANUSHA S',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS07',name:'ELANCHERAN K',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS08',name:'HARIS PRABU M',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS09',name:'HEMASUTHAN M',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS10',name:'JAYAKUMAR V',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS11',name:'JEBIN ABISHAKE',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS12',name:'JOSHNA P S',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS13',name:'JOSHUA DANIEL A',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS14',name:'LOGESHWARAN M',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS15',name:'MATHANRAJ N',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS16',name:'MITHUNRAJ',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS17',name:'MURUGESAN V',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS18',name:'NAREN KARTHIKEYAN S',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS19',name:'PAVITHA D',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS20',name:'PRASANNA S',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS21',name:'PRASANNA KUMAR M',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS22',name:'PRAVEEN KUMAR M',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS23',name:'PRISHA GAAYATHRI V',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS24',name:'RAJU S',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTGT25',name:'RAMJI K',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS26',name:'RISHIKESH B R',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS27',name:'SAM ROSHAN',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS28',name:'SASISANKAR U L',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS29',name:'SHANMUGA PRIYA S B',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS31',name:'SONIA R',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS32',name:'SREEKHA S',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS33',name:'SUBHASHINI G M',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS34',name:'SUDHAKAR G',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS35',name:'SUGUNA S',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS36',name:'SWETHA SIVADHARSHINI R',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS37',name:'VIKRAM G',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS38',name:'VISHNU R',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS39',name:'YASWANTH KUMAR S',program:'MTech',class_name:'IV MTech'},
      { reg_no:'22MTCS40',name:'YOGESHWARAN R',program:'MTech',class_name:'IV MTech'},
    ];
    await batchWrite('class_students', classStudents);

    // Also seed Student USERS for login
    console.log('\n  → Seeding student login users...');
    const CLASS_CONFIG = {
      'II MCA':    { program: 'MCA',        semester: 2, batch_year: '2024-27' },
      'II MSc CS': { program: 'MSc CS',     semester: 2, batch_year: '2024-26' },
      'II MSc DS': { program: 'MSc AI & DS',semester: 2, batch_year: '2024-26' },
      'II MSc AI': { program: 'MSc AI & DS',semester: 2, batch_year: '2024-26' },
      'IV MTech':  { program: 'MTech CS',   semester: 4, batch_year: '2022-24' },
    };
    const studentUserDocs = [];
    for (const cs of classStudents) {
      studentUserDocs.push({
        user_id: cs.reg_no,
        name: cs.name,
        email: cs.reg_no.toLowerCase() + '@student.edu',
        password_hash: stuPw,
        role: 'student',
        program: CLASS_CONFIG[cs.class_name]?.program || 'MCA',
        semester: CLASS_CONFIG[cs.class_name]?.semester || 2,
        class_name: cs.class_name,
        created_at: new Date().toISOString()
      });
    }
    await batchWrite('students', studentUserDocs);
  }

  // ───────────────────────────────
  // 3. ALUMNI Collection
  // ───────────────────────────────
  if (await isAlreadySeeded('alumni')) {
    console.log('  ⏭  alumni: already seeded, skipping.');
  } else {
    const alumni = [
      { user_id: 'ALM2022001', name: 'Priya Subramanian',   email: 'priya.s@alumni.edu',    batch_year: '2020-22', program: 'MSc CS',     current_company: 'Google India',      current_role: 'Software Engineer II', linkedin: 'https://linkedin.com/in/priyasubramanian',  available_for_mentorship: 1 },
      { user_id: 'ALM2022002', name: 'Karthik Raja M',      email: 'karthik.r@alumni.edu',  batch_year: '2020-22', program: 'MCA',        current_company: 'Infosys',           current_role: 'Senior Developer',     linkedin: 'https://linkedin.com/in/karthikrajam',      available_for_mentorship: 1 },
      { user_id: 'ALM2023001', name: 'Divya Bharathi S',    email: 'divya.b@alumni.edu',    batch_year: '2021-23', program: 'MSc AI & DS',current_company: 'TCS',              current_role: 'Data Analyst',         linkedin: 'https://linkedin.com/in/divyabharathi',     available_for_mentorship: 1 },
      { user_id: 'ALM2023002', name: 'Arun Prasad K',       email: 'arun.p@alumni.edu',     batch_year: '2021-23', program: 'MSc CS',     current_company: 'Zoho Corporation',  current_role: 'Product Engineer',     linkedin: 'https://linkedin.com/in/arunprasadk',       available_for_mentorship: 0 },
      { user_id: 'ALM2024001', name: 'Nandhini Velmurugan', email: 'nandhini.v@alumni.edu', batch_year: '2022-24', program: 'MTech CS',   current_company: 'HCL Technologies', current_role: 'Software Consultant',  linkedin: 'https://linkedin.com/in/nandhinivelmurugan',available_for_mentorship: 1 },
    ];
    await batchWrite('alumni', alumni);
  }

  // ───────────────────────────────
  // 4. NOTICES
  // ───────────────────────────────
  if (await isAlreadySeeded('notices')) {
    console.log('  ⏭  notices: already seeded, skipping.');
  } else {
    await batchWrite('notices', [
      { title: 'Exam Schedule Released', content: 'Check portal for internal exam timetable.', category: 'exam',    posted_by: 'BDU1670884', posted_by_name: 'Dr. E. George Dharma Prakash Raj', created_at: new Date().toISOString() },
      { title: 'College Day Function',   content: 'Annual college day on 15th April 2025.',    category: 'event',   posted_by: 'BDU1670884', posted_by_name: 'Dr. E. George Dharma Prakash Raj', created_at: new Date().toISOString() },
      { title: 'Library New Arrivals',   content: 'New books added to the CS section.',         category: 'general', posted_by: 'BDU1670884', posted_by_name: 'Dr. E. George Dharma Prakash Raj', created_at: new Date().toISOString() },
    ]);
  }

  // ───────────────────────────────
  // 5. EVENTS
  // ───────────────────────────────
  if (await isAlreadySeeded('events')) {
    console.log('  ⏭  events: already seeded, skipping.');
  } else {
    await batchWrite('events', [
      { title: 'Tech Symposium 2025',    description: 'Annual tech fest at BDU campus.', event_date: '2025-04-10', venue: 'Main Hall',     type: 'academic', created_at: new Date().toISOString() },
      { title: 'Placement Drive - TCS',  description: 'TCS Off-campus drive for final year students.', event_date: '2025-04-20', venue: 'Placement Cell', type: 'placement', created_at: new Date().toISOString() },
      { title: 'Guest Lecture on AI',    description: 'Talk by industry expert on Generative AI.', event_date: '2025-03-28', venue: 'Seminar Hall',  type: 'academic', created_at: new Date().toISOString() },
    ]);
  }

  // ───────────────────────────────
  // 6. TIMETABLE (sample)
  // ───────────────────────────────
  if (await isAlreadySeeded('timetable')) {
    console.log('  ⏭  timetable: already seeded, skipping.');
  } else {
    await batchWrite('timetable', [
      { program: 'MSc CS', semester: 2, day: 'Monday',    start_time: '09:00', end_time: '10:00', course_id: 'CS501', course_name: 'Data Structures',         room: 'Room 301', staff_name: 'Dr. M. Lalli' },
      { program: 'MSc CS', semester: 2, day: 'Monday',    start_time: '10:00', end_time: '11:00', course_id: 'CS502', course_name: 'Algorithms',               room: 'Room 302', staff_name: 'Dr. P. Sumathy' },
      { program: 'MSc CS', semester: 2, day: 'Tuesday',   start_time: '09:00', end_time: '10:00', course_id: 'CS503', course_name: 'Cloud Computing',          room: 'Room 301', staff_name: 'Dr. E. George Dharma Prakash Raj' },
      { program: 'MSc CS', semester: 2, day: 'Wednesday', start_time: '11:00', end_time: '12:00', course_id: 'CS504', course_name: 'Machine Learning',         room: 'Room 303', staff_name: 'Dr. M. Durairaj' },
      { program: 'MCA',    semester: 2, day: 'Monday',    start_time: '09:00', end_time: '10:00', course_id: 'MCA501',course_name: 'Database Systems',         room: 'Room 201', staff_name: 'Dr. Gopinath Ganapathy' },
      { program: 'MCA',    semester: 2, day: 'Tuesday',   start_time: '10:00', end_time: '11:00', course_id: 'MCA502',course_name: 'Web Technologies',         room: 'Room 202', staff_name: 'Prof.(Dr.) M. Balamurugan' },
    ]);
  }

  // ───────────────────────────────
  // 7. PLACEMENTS
  // ───────────────────────────────
  if (await isAlreadySeeded('placements')) {
    console.log('  ⏭  placements: already seeded, skipping.');
  } else {
    await batchWrite('placements', [
      { company_name: 'TCS', role: 'Software Engineer', package: '4.5 LPA', type: 'full_time', location: 'Chennai', apply_link: 'https://www.tcs.com/careers', deadline: '2025-04-15', posted_at: new Date().toISOString() },
      { company_name: 'Infosys', role: 'Systems Engineer', package: '3.6 LPA', type: 'full_time', location: 'Bangalore', apply_link: 'https://career.infosys.com', deadline: '2025-04-20', posted_at: new Date().toISOString() },
      { company_name: 'Zoho', role: 'Software Developer Intern', package: '15,000/month', type: 'internship', location: 'Chennai', apply_link: 'https://zoho.com/careers', deadline: '2025-03-31', posted_at: new Date().toISOString() },
    ]);
  }

  console.log('\n🎉 ALL DONE! Firestore seeding complete!');
  console.log('\n📋 Login Credentials:');
  console.log('  Admin   → BDU1670884 / Admin@1234');
  console.log('  Staff   → BDU1660758 / Staff@1234');
  console.log('  Student → 24MSCCS18 (reg_no) / Student@1234');
  console.log('  Alumni  → ALM2022001 / Alumni@1234');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
