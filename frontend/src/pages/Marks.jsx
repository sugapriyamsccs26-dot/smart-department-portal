import { useState, useEffect } from 'react';
import { api } from '../api';

const EXT_CLASSES_STUDENTS = {
  'MCA': [
    { id: '24MCA01', name: 'ABDUL KALAM AZAD N' },
    { id: '24MCA02', name: 'ANBALAGAN K' },
    { id: '24MCA03', name: 'AROCKIYA LIGIFEMINA D' },
    { id: '24MCA04', name: 'BASKAR P' },
    { id: '24MCA05', name: 'BHARANIDHARAN S' },
    { id: '24MCA06', name: 'CATHERIN JECINTHA J R' },
    { id: '24MCA07', name: 'DHANAM A' },
    { id: '24MCA08', name: 'DHANUSHIYA S' },
    { id: '24MCA09', name: 'ESWARI N' },
    { id: '24MCA10', name: 'HARIHARAN M' },
    { id: '24MCA11', name: 'JEEVAN D' },
    { id: '24MCA12', name: 'KEERTHANA A' },
    { id: '24MCA13', name: 'MADESH C' },
    { id: '24MCA14', name: 'MOHAN RAM G' },
    { id: '24MCA15', name: 'MUTHULAKSHMI' },
    { id: '24MCA16', name: 'NAFEES ASHFAQ AHAMED N' },
    { id: '24MCA17', name: 'NANCY B' },
    { id: '24MCA18', name: 'NIRUBAN A' },
    { id: '24MCA19', name: 'PRAKASH R' },
    { id: '24MCA20', name: 'PUNITHA M' },
    { id: '24MCA21', name: 'RAGUL C A' },
    { id: '24MCA22', name: 'RAHUL S' },
    { id: '24MCA23', name: 'RAJESWARI M' },
    { id: '24MCA24', name: 'SABARINATHAN S' },
    { id: '24MCA25', name: 'SANJAI M' },
    { id: '24MCA26', name: 'SANJAY R' },
    { id: '24MCA27', name: 'SANTHOSH KUMAR P' },
    { id: '24MCA28', name: 'SARAN G' },
    { id: '24MCA29', name: 'SIBI GLAXON E' },
    { id: '24MCA30', name: 'SRI HARINI S' },
    { id: '24MCA31', name: 'STEWARD RIGHTEOUS T' },
    { id: '24MCA32', name: 'SUDHARSAN R' },
    { id: '24MCA33', name: 'SUMATHI S' },
    { id: '24MCA34', name: 'VARSHINI V' },
    { id: '24MCA35', name: 'VEERAMANI E' },
    { id: '24MCA36', name: 'VENKATESH P' },
    { id: '24MCA37', name: 'VIVIN SAMUEL F' },
    { id: '24MCA38', name: 'YUVASRI R' }
  ],
  'MSC CS': [
    { id: '24MSCCS01', name: 'ABINAYA N' },
    { id: '24MSCCS02', name: 'ABIRAMI K' },
    { id: '24MSCCS03', name: 'ABIRAYANA K' },
    { id: '24MSCCS04', name: 'DINESH T' },
    { id: '24MSCCS05', name: 'ESWARI P' },
    { id: '24MSCCS06', name: 'HEMA VESALINI R' },
    { id: '24MSCCS07', name: 'JUVITHA B' },
    { id: '24MSCCS08', name: 'KATHIRESAN P' },
    { id: '24MSCCS09', name: 'KAVIYA S' },
    { id: '24MSCCS10', name: 'KEERTHANA G' },
    { id: '24MSCCS11', name: 'KUMARAGURU S' },
    { id: '24MSCCS12', name: 'MOHAMED JAMAL JUNAITH P' },
    { id: '24MSCCS13', name: 'NAVEENKUMAR V' },
    { id: '24MSCCS14', name: 'RAGAVAMOORTHI K' },
    { id: '24MSCCS15', name: 'RAHUL ROSHAN J' },
    { id: '24MSCCS16', name: 'SOWMIYA S' },
    { id: '24MSCCS17', name: 'SRIHARINI S' },
    { id: '24MSCCS18', name: 'SUGA PRIYA R' },
    { id: '24MSCCS19', name: 'SUNDARESAN J' },
    { id: '24MSCCS20', name: 'VARSHA K' },
    { id: '24MSCCS21', name: 'YAMUNA PRIYA R' },
    { id: '24MSCCS22', name: 'YOGESHWARAN R' },
    { id: '24MSCCS24', name: 'RAMYA S' }
  ],
  'MSC DS': [
    { id: '24MSCDS01', name: 'ABI T' },
    { id: '24MSCDS02', name: 'AJAYY KUMAAR K' },
    { id: '24MSCDS03', name: 'CHANDRU K' },
    { id: '24MSCDS04', name: 'DHANAPRIYA D' },
    { id: '24MSCDS05', name: 'DURGA DEVI K' },
    { id: '24MSCDS06', name: 'GIRIDHARAN M' },
    { id: '24MSCDS07', name: 'HARINI S' },
    { id: '24MSCDS08', name: 'JAYANTH R' },
    { id: '24MSCDS09', name: 'MADHAVAN V' },
    { id: '24MSCDS10', name: 'MANIKANDAA S' },
    { id: '24MSCDS11', name: 'MANOJ KUMAR N' },
    { id: '24MSCDS12', name: 'MARIYA JERON ROY A' },
    { id: '24MSCDS13', name: 'MOHAMED IBRAHIM K' },
    { id: '24MSCDS14', name: 'MOHAMED SUHAIL A' },
    { id: '24MSCDS15', name: 'MOHAMMED ABUTHAGHIR A' },
    { id: '24MSCDS16', name: 'NARMATHA R' },
    { id: '24MSCDS17', name: 'NAVEENKUMAR C' },
    { id: '24MSCDS18', name: 'PRITHIV RAJ M' },
    { id: '24MSCDS19', name: 'RIYASKHAN J' },
    { id: '24MSCDS20', name: 'SAKTHY MARY PARVEEN T S' },
    { id: '24MSCDS22', name: 'SHIBIVARSHAN S' },
    { id: '24MSCDS23', name: 'SHIVARAMAKRISHNAN D' },
    { id: '24MSCDS24', name: 'SURYA KUMAR G' },
    { id: '24MSCDS25', name: 'TANISHQ RAJA S G' },
    { id: '24MSCDS26', name: 'YOGESHWARAN M' },
    { id: '24MSCDS27', name: 'BUVANA S' }
  ],
  'MSC AI': [
    { id: '24MSCAI01', name: 'DEEPA S' },
    { id: '24MSCAI02', name: 'GANESH R' },
    { id: '24MSCAI03', name: 'GIRENIVAAS S R' },
    { id: '24MSCAI04', name: 'HARISH S' },
    { id: '24MSCAI05', name: 'INIGOANAND L' },
    { id: '24MSCAI06', name: 'MERLIN CIBYA RANI M' },
    { id: '24MSCAI07', name: 'RANJITH KUMAR B' },
    { id: '24MSCAI08', name: 'SRIKHANTH R' },
    { id: '24MSCAI09', name: 'VIMAL RAJ A' },
    { id: '24MSCAI10', name: 'VISHAL MURALI M R' },
    { id: '24MSCAI11', name: 'NANTHABALAN' }
  ],
  'MTECH': [
    { id: '22MTCS01', name: 'ADHITYA M R' },
    { id: '22MTCS02', name: 'AGALYA N' },
    { id: '22MTCS03', name: 'ANBU SWETHA B' },
    { id: '22MTCS04', name: 'ANITHA M' },
    { id: '22MTCS05', name: 'DHAMODHARAN J' },
    { id: '22MTCS06', name: 'DHANUSHA S' },
    { id: '22MTCS07', name: 'ELANCHERAN K' },
    { id: '22MTCS08', name: 'HARIS PRABU M' },
    { id: '22MTCS09', name: 'HEMASUTHAN M' },
    { id: '22MTCS10', name: 'JAYAKUMAR V' },
    { id: '22MTCS11', name: 'JEBIN ABISHAKE' },
    { id: '22MTCS12', name: 'JOSHNA P S' },
    { id: '22MTCS13', name: 'JOSHUA DANIEL A' },
    { id: '22MTCS14', name: 'LOGESHWARAN M' },
    { id: '22MTCS15', name: 'MATHANRAJ N' },
    { id: '22MTCS16', name: 'MITHUNRAJ' },
    { id: '22MTCS17', name: 'MURUGESAN V' },
    { id: '22MTCS18', name: 'NAREN KARTHIKEYAN S' },
    { id: '22MTCS19', name: 'PAVITHA D' },
    { id: '22MTCS20', name: 'PRASANNA S' },
    { id: '22MTCS21', name: 'PRASANNA KUMAR M' },
    { id: '22MTCS22', name: 'PRAVEEN KUMAR M' },
    { id: '22MTCS23', name: 'PRISHA GAAYATHRI V' },
    { id: '22MTGT25', name: 'RAMJI K' },
    { id: '22MTCS26', name: 'RISHIKESH B R' },
    { id: '22MTCS27', name: 'SAM ROSHAN' },
    { id: '22MTCS28', name: 'SASISANKAR U L' },
    { id: '22MTCS29', name: 'SHANMUGA PRIYA S B' },
    { id: '22MTCS31', name: 'SONIA R' },
    { id: '22MTCS32', name: 'SREEKHA S' },
    { id: '22MTCS33', name: 'SUBHASHINI G M' },
    { id: '22MTCS34', name: 'SUDHAKAR G' },
    { id: '22MTCS35', name: 'SUGUNA S' },
    { id: '22MTCS36', name: 'SWETHA SIVADHARSHINI R' },
    { id: '22MTCS37', name: 'VIKRAM G' },
    { id: '22MTCS38', name: 'VISHNU R' },
    { id: '22MTCS39', name: 'YASWANTH KUMAR S' },
    { id: '22MTCS40', name: 'YOGESHWARAN R' }
  ]
};

const EXT_SUBJECTS = {
  'MCA': ['Advanced Java Programming', 'Data Structures & Algorithms', 'Database Management Systems', 'Operating Systems', 'Software Engineering', 'Web Technologies', 'Java Programming Lab', 'Web Technologies Lab'],
  'MSC CS': ['Machine Learning', 'Cloud Computing', 'Advanced Algorithms', 'Compiler Design', 'Network Security', 'Python Programming', 'Machine Learning Lab', 'Python Programming Lab'],
  'MSC DS': ['Big Data Analytics', 'Deep Learning', 'Data Mining Techniques', 'Statistical Methods', 'R Programming', 'Business Intelligence', 'Big Data Analytics Lab', 'R Programming Lab'],
  'MSC AI': ['Artificial Intelligence', 'Neural Networks', 'Computer Vision', 'Natural Language Processing', 'Reinforcement Learning', 'AI Ethics & Governance', 'Computer Vision Lab', 'Neural Networks Lab'],
  'MTECH': ['Advanced Operating Systems', 'Distributed Systems', 'Research Methodology', 'Advanced Computer Networks', 'IoT Systems', 'Embedded Systems', 'IoT Systems Lab', 'Embedded Systems Lab']
};

const EXT_EXAMS = ['Cycle Test 1', 'Cycle Test 2', 'Model Exam', 'Semester Exam'];

const CLASS_TO_SEM = {
  'MCA': 2,
  'MSC CS': 2,
  'MSC DS': 2,
  'MSC AI': 2,
  'MTECH': 4
};

export default function Marks({ user }) {
  const [marks, setMarks] = useState({ semMarks: [], examMarks: [] });
  const [loading, setLoading] = useState(true);
  
  // Legacy form state
  const [form, setForm] = useState({ student_id: '', course_id: '', semester: '', internal_marks: '', external_marks: '' });
  
  // Structured Category form state
  const [structuredForm, setStructuredForm] = useState({ student_id: '', course_id: '', semester: '', marks: '' });
  
  // Report download state
  const [reportState, setReportState] = useState({ className: 'I MCA', course_id: '' });
  const [classes, setClasses] = useState([]);

  const [msg, setMsg] = useState('');
  
  // Tab selector state
  const TABS = ['Enter Marks', 'Internal 1', 'Internal 2', 'Model Exam', 'Semester'];
  const [activeTab, setActiveTab] = useState('Enter Marks');

  const isStaffOrAdmin = user.role === 'staff' || user.role === 'admin';

  const ObjectKeysCls = Object.keys(EXT_CLASSES_STUDENTS);
  const [extClass, setExtClass] = useState(ObjectKeysCls[0]);
  const [extExam, setExtExam] = useState(EXT_EXAMS[0]);
  const [extSubject, setExtSubject] = useState(EXT_SUBJECTS[ObjectKeysCls[0]][0]);
  const [extMarksData, setExtMarksData] = useState({});
  const [extSearch, setExtSearch] = useState('');

  const [staffSemester, setStaffSemester] = useState(2);

  useEffect(() => {
    setExtSubject(EXT_SUBJECTS[extClass][0]);
    // Optionally auto-set semester based on class, but allow override
    if (CLASS_TO_SEM[extClass]) setStaffSemester(CLASS_TO_SEM[extClass]);
  }, [extClass]);

  useEffect(() => {
    if (!extClass || !extExam || !extSubject) return;
    loadGridData();
  }, [extClass, extExam, extSubject, staffSemester]);

  async function loadGridData() {
    try {
      setLoading(true);
      const data = await api.get(`/marks/bulk/fetch?className=${encodeURIComponent(extClass)}&course_id=${encodeURIComponent(extSubject)}&exam_type=${encodeURIComponent(extExam)}&semester=${staffSemester}`);
      const loadedData = {};
      data.forEach(m => {
        loadedData[m.student_id] = { internal: m.internal, external: m.external };
      });
      setExtMarksData(loadedData);
    } catch (err) {
      console.error('Failed to load grid data', err);
      setExtMarksData({});
    } finally {
      setLoading(false);
    }
  }

  function handleExtMarkChange(id, field, val) {
    let cleanVal = String(val).replace(/[^0-9]/g, '');
    let numericVal = cleanVal === '' ? '' : Number(cleanVal);
    
    if (numericVal !== '') {
       if (numericVal < 0) numericVal = 0;
       if (field === 'internal' && numericVal > 25) numericVal = 25;
       if (field === 'external' && numericVal > 75) numericVal = 75;
    }

    setExtMarksData(prev => ({ 
      ...prev, 
      [id]: { ...(prev[id] || { internal: '', external: '' }), [field]: numericVal } 
    }));
  }

  async function handleSaveSubmit() {
    setMsg('');
    const students = EXT_CLASSES_STUDENTS[extClass] || [];
    const marksData = [];
    
    students.forEach(s => {
      const d = extMarksData[s.id];
      if (d && (d.internal !== '' || d.external !== '')) {
         marksData.push({
           student_id: s.id,
           internal: d.internal || 0,
           external: d.external || 0
         });
      }
    });

    if (marksData.length === 0) {
      setMsg('No marks to save.');
      return;
    }

    try {
       setLoading(true);
       const res = await api.post('/marks/bulk', {
         semester: Number(staffSemester),
         exam_type: extExam,
         course_id: extSubject,
         marks_data: marksData
       });
       setMsg(res.message || 'Marks successfully saved to database!');
    } catch (err) {
       setMsg('Failed to save marks. Check server Connection.');
    } finally {
       setLoading(false);
    }
  }

  useEffect(() => { 
    loadMarks(); 
    if (user.role === 'admin') {
       api.get('/students/classes').then(data => {
          setClasses(data);
          if (data && data.length > 0) {
             setReportState(r => ({ ...r, className: data[0].class_name }));
          }
       }).catch(() => {});
    }
  }, []);

  async function loadMarks() {
    // If staff/admin and no student_id entered yet, skip loading marks list
    if (isStaffOrAdmin && !form.student_id) {
       setMarks({ semMarks: [], examMarks: [] });
       setLoading(false);
       return;
    }

    setLoading(true);
    try {
      const sid = isStaffOrAdmin ? form.student_id : user.user_id;
      const data = await api.get(`/marks?student_id=${sid}`);
      setMarks(data); // Will be { semMarks, examMarks }
    } catch { setMarks({ semMarks: [], examMarks: [] }); } finally { setLoading(false); }
  }

  // Legacy Submit
  async function submitMarks(e) {
    e.preventDefault(); setMsg(''); setLoading(true);
    try {
      const res = await api.post('/marks', { ...form, internal_marks: Number(form.internal_marks), external_marks: Number(form.external_marks) });
      setMsg(res.message || 'Marks saved!');
      loadMarks();
    } catch (err) { setMsg(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  }

  // Add-On: Structured Category Submit
  async function submitStructuredMarks(e) {
    e.preventDefault(); setMsg(''); setLoading(true);
    try {
      const res = await api.post('/marks/structured', { 
         ...structuredForm, 
         exam_type: activeTab,
         marks: Number(structuredForm.marks) 
      });
      setMsg(res.message || `${activeTab} Marks saved!`);
      // Optionally load marks if they affect the main table (aggregated view planned later)
      loadMarks(); 
    } catch (err) { setMsg(err.response?.data?.message || err.message); }
    finally { setLoading(false); }
  }

  // Add-On: CSV Download
  async function downloadReport() {
     setMsg('');
     try {
        let url = `/marks/export/${encodeURIComponent(reportState.className)}`;
        if (reportState.course_id) url += `?course_id=${encodeURIComponent(reportState.course_id)}`;
        
        const data = await api.get(url);
        if (!data || data.length === 0) {
            setMsg('No data found for this class/course.');
            return;
        }

        // Convert JSON to CSV
        const headers = ['Register Number', 'Name', 'Course ID', 'Internal 1', 'Internal 2', 'Model Exam', 'Semester'];
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = headers.map(header => {
                const val = row[header] === undefined || row[header] === null ? '-' : row[header];
                return `"${val}"`;
            });
            csvRows.push(values.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Marks_Report_${reportState.className.replace(/\s+/g, '_')}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setMsg('Report downloaded successfully!');
     } catch (err) {
        setMsg('Failed to download report.');
     }
  }

  function getGrade(total) {
    const t = Number(total) || 0;
    if (t >= 90) return { g: 'O', c: 'var(--accent)' };
    if (t >= 80) return { g: 'A+', c: 'var(--accent)' };
    if (t >= 70) return { g: 'A', c: 'var(--primary-light)' };
    if (t >= 60) return { g: 'B+', c: 'var(--info)' };
    if (t >= 50) return { g: 'B', c: 'var(--accent3)' };
    return { g: 'F', c: 'var(--accent2)' };
  }

  // ── New Student Result state ──────────────────────────────────────────
  const [studentResultTab, setStudentResultTab] = useState('Cycle Test 1');

  if (!isStaffOrAdmin) {
    // Exam type mapping
    const TAB_TO_EXAM_TYPE = {
      'Cycle Test 1': 'Internal 1',
      'Cycle Test 2': 'Internal 2',
      'Model Exam':   'Model Exam',
    };

    // Build semester subjects map
    const semSubjects = {}; // { course_id -> { internal, external, total } }
    if (marks.semMarks) {
      marks.semMarks.forEach(m => {
        semSubjects[m.course_id] = m;
      });
    }

    // Build exam subjects map per exam_type — store full mark objects
    const examSubjects = {}; // { exam_type -> { course_id -> fullMarkObj } }
    if (marks.examMarks) {
      marks.examMarks.forEach(m => {
        if (!examSubjects[m.exam_type]) examSubjects[m.exam_type] = {};
        examSubjects[m.exam_type][m.course_id] = m; // store full object
      });
    }

    // CGPA Logic — based on semester marks only
    const getPoint = g => ({ 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'F': 0 }[g] || 0);
    let totalPoints = 0, totalSubjects = 0;
    Object.values(semSubjects).forEach(m => {
      const { g } = getGrade(m.total);
      totalPoints += getPoint(g);
      totalSubjects++;
    });
    const cgpa = totalSubjects > 0 ? (totalPoints / totalSubjects).toFixed(2) : '0.00';

    // Get subject list for current tab only
    let tabRows = [];
    if (studentResultTab === 'Semester Exam') {
      tabRows = Object.entries(semSubjects).map(([cid, m]) => ({
        cid,
        internal: m.internal_marks,
        external: m.external_marks,
        total: m.total,
      }));
    } else {
      const mappedType = TAB_TO_EXAM_TYPE[studentResultTab];
      const subMap = examSubjects[mappedType] || {};
      tabRows = Object.entries(subMap).map(([cid, m]) => {
        // Smart fallback: use marks column if internal_marks is 0 but marks has real data
        const intVal = (m.internal_marks != null && m.internal_marks > 0) ? m.internal_marks : (m.marks || 0);
        const extVal = (m.external_marks != null && m.external_marks > 0) ? m.external_marks : null;
        const totVal = (m.total != null && m.total > 0) ? m.total : intVal + (extVal || 0);
        return { cid, internal: intVal, external: extVal, total: totVal };
      });
    }

    return (
      <div className="animate-in">
        <h2 className="section-title">🏆 Academic Results</h2>
        <p className="section-subtitle">Track your performance across cycle tests, model evaluations, and final semesters.</p>

        {/* Status Bar */}
        <div className="card mb-6" style={{ background: 'var(--brown-primary)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div className="text-sm" style={{ opacity: 0.8 }}>Current CGPA</div>
             <div style={{ fontSize: 36, fontWeight: 800 }}>{cgpa} <span style={{ fontSize: 14, opacity: 0.7 }}>/ 10.0</span></div>
           </div>
           <div style={{ textAlign: 'right' }}>
             <div className="text-sm" style={{ opacity: 0.8 }}>Academic Standing</div>
             <div className="badge" style={{ background: Number(cgpa) >= 8.5 ? 'var(--brown-dark)' : 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 14 }}>
               {Number(cgpa) >= 8.5 ? 'Distinction' : Number(cgpa) >= 6.0 ? 'First Class' : 'Second Class'}
             </div>
           </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
           {['Cycle Test 1', 'Cycle Test 2', 'Model Exam', 'Semester Exam'].map(t => (
             <button key={t} className={`btn ${studentResultTab === t ? 'btn-primary' : 'btn-secondary'}`} style={{ border: studentResultTab !== t ? 'none' : '', whiteSpace: 'nowrap' }} onClick={() => setStudentResultTab(t)}>
               {t}
             </button>
           ))}
        </div>

        {loading ? <div className="flex-center" style={{ padding: 40 }}><div className="spinner" /></div> : (
          <div className="card">
            <div className="card-header"><span className="card-title">{studentResultTab} Records</span></div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Internal (25)</th>
                    <th>External (75)</th>
                    <th>Total (100)</th>
                    <th>Grade</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {tabRows.length === 0 ? (
                    <tr><td colSpan={6} className="text-center" style={{ padding: 40 }}>No records found for {studentResultTab}.</td></tr>
                  ) : tabRows.map(({ cid, internal, external, total }) => {
                    const isSemester = studentResultTab === 'Semester Exam';
                    const dispInternal = internal !== null && internal !== undefined ? internal : '-';
                    
                    let dispExternal = '-';
                    let dispTotal = '-';
                    let finalGrade = '-';
                    let gradeColor = 'inherit';
                    let badgeText = '';
                    let badgeClass = '';

                    if (isSemester) {
                      const extMissing = !external || Number(external) === 0;
                      if (extMissing) {
                        dispExternal = '-';
                        dispTotal = '-';
                        finalGrade = '-';
                        badgeText = 'PENDING';
                        badgeClass = 'badge-secondary';
                      } else {
                        dispExternal = external;
                        dispTotal = total !== null && total !== undefined ? total : '-';
                        const { g, c } = getGrade(dispTotal === '-' ? 0 : dispTotal);
                        finalGrade = g;
                        gradeColor = c;
                        const isPass = Number(dispTotal) >= 50 && finalGrade !== 'F';
                        badgeText = isPass ? 'PASS' : 'FAIL';
                        badgeClass = isPass ? 'badge-present' : 'badge-absent';
                      }
                    } else {
                      // Cycle Test / Model Exam — same logic as Semester Exam
                      const extMissing = !external || Number(external) === 0;
                      if (extMissing) {
                        // Only internal entered — show internal, pending for rest
                        dispExternal = '-';
                        dispTotal = '-';
                        finalGrade = '-';
                        badgeText = 'PENDING';
                        badgeClass = 'badge-secondary';
                      } else {
                        dispExternal = external;
                        dispTotal = total !== null && total !== undefined ? total : '-';
                        const { g, c } = getGrade(dispTotal === '-' ? 0 : dispTotal);
                        finalGrade = g;
                        gradeColor = c;
                        const isPass = Number(dispTotal) >= 50 && finalGrade !== 'F';
                        badgeText = isPass ? 'PASS' : 'FAIL';
                        badgeClass = isPass ? 'badge-present' : 'badge-absent';
                      }
                    }

                    return (
                      <tr key={cid}>
                        <td className="fw-500" style={{ fontSize: 13 }}>{cid || 'General'}</td>
                        <td>{dispInternal}</td>
                        <td>{dispExternal}</td>
                        <td className="fw-700">{dispTotal}</td>
                        <td><span style={{ color: gradeColor, fontWeight: 800 }}>{finalGrade}</span></td>
                        <td>
                           {badgeText && (
                             <span className={`badge ${badgeClass}`} style={badgeText === 'PENDING' ? { border: 'none', background: '#9ca3af', color: '#fff' } : { border: 'none' }}>
                               {badgeText}
                             </span>
                           )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in">
      <h2 className="section-title">📊 Marks & Results</h2>
      <p className="section-subtitle">Internal marks, external exam scores, CGPA overview, and structured evaluations</p>



      {isStaffOrAdmin && (
        <div className="card mb-6">
          <div style={{ padding: '24px' }}>
             {msg && <div className={`alert ${msg.includes('!') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
             
             {activeTab === 'Enter Marks' ? (() => {
               const studentsOfClass = EXT_CLASSES_STUDENTS[extClass];
               const filteredStudents = studentsOfClass.filter(s => 
                  s.name.toLowerCase().includes(extSearch.toLowerCase()) || 
                  s.id.toLowerCase().includes(extSearch.toLowerCase())
               );
               
               let validMarksCount = 0;
               let passCount = 0;
               let totalSum = 0;
               let highest = -1;
               let lowest = 999;
               
               studentsOfClass.forEach(s => {
                 const d = extMarksData[s.id];
                 if (d && (typeof d.internal === 'number' || typeof d.external === 'number')) {
                   validMarksCount++;
                   const tot = (d.internal || 0) + (d.external || 0);
                   totalSum += tot;
                   if (tot >= 50) passCount++;
                   if (tot > highest) highest = tot;
                   if (tot < lowest) lowest = tot;
                 }
               });
               
               const avgStat = validMarksCount > 0 ? (totalSum / validMarksCount).toFixed(1) : 0;
               const highStat = validMarksCount > 0 ? highest : 0;
               const lowStat = validMarksCount > 0 ? lowest : 0;
               const passPct = validMarksCount > 0 ? Math.round((passCount / validMarksCount) * 100) : 0;

               return (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 16 }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Class</label>
                        <select className="form-control" value={extClass} onChange={e => setExtClass(e.target.value)}>
                          {Object.keys(EXT_CLASSES_STUDENTS).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                       <div className="form-group" style={{ margin: 0 }}>
                         <label className="form-label">Semester</label>
                         <select className="form-control" value={staffSemester} onChange={e => setStaffSemester(Number(e.target.value))}>
                           {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                         </select>
                       </div>
                       <div className="form-group" style={{ margin: 0 }}>
                         <label className="form-label">Exam</label>
                        <select className="form-control" value={extExam} onChange={e => setExtExam(e.target.value)}>
                          {EXT_EXAMS.map(x => <option key={x} value={x}>{x}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                                                 <label className="form-label">Subject</label>
                         <select className="form-control" value={extSubject} onChange={e => setExtSubject(e.target.value)}>
                          {EXT_SUBJECTS[extClass].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Search</label>
                        <input type="text" className="form-control" placeholder="Search student..." value={extSearch} onChange={e => setExtSearch(e.target.value)} />
                      </div>
                   </div>

                   <div className="card-grid card-grid-4">
                      <div className="card" style={{ textAlign: 'center', padding: '16px 12px', background: 'var(--surface)' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{avgStat}</div>
                        <div className="text-muted text-sm mt-1">Average</div>
                      </div>
                      <div className="card" style={{ textAlign: 'center', padding: '16px 12px', background: 'var(--surface)' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{highStat}</div>
                        <div className="text-muted text-sm mt-1">Highest</div>
                      </div>
                      <div className="card" style={{ textAlign: 'center', padding: '16px 12px', background: 'var(--surface)' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent2)' }}>{lowStat}</div>
                        <div className="text-muted text-sm mt-1">Lowest</div>
                      </div>
                      <div className="card" style={{ textAlign: 'center', padding: '16px 12px', background: 'var(--surface)' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: passPct >= 50 ? '#10b981' : '#ef4444' }}>{passPct}%</div>
                        <div className="text-muted text-sm mt-1">Pass %</div>
                      </div>
                   </div>

                   <div className="table-wrapper" style={{ border: '1px solid var(--border)', borderRadius: 12 }}>
                     <table>
                       <thead>
                          <tr>
                           <th>Reg No</th>
                           <th>Name</th>
                           <th style={{ width: 110 }}>Internal (25)</th>
                           <th style={{ width: 110 }}>External (75)</th>
                           <th style={{ width: 100 }}>Total (100)</th>
                           <th style={{ width: 80 }}>Grade</th>
                           <th style={{ width: 100 }}>Status</th>
                         </tr>
                       </thead>
                       <tbody>
                         {filteredStudents.length === 0 ? (
                           <tr><td colSpan={7}><div className="empty-state">No students found.</div></td></tr>
                         ) : (
                           filteredStudents.map(s => {
                             const d = extMarksData[s.id] || {};
                             const intVal = d.internal !== undefined ? d.internal : '';
                             const extVal = d.external !== undefined ? d.external : '';
                             
                             let displayTotal = '-';
                             let gradeStr = '-';
                             let gradeColor = 'inherit';
                             let badgeText = 'PENDING';
                             let badgeColor = '#fff';
                             let badgeBg = '#9ca3af';

                             const intNum = Number(intVal) || 0;
                             const extNum = Number(extVal) || 0;
                             
                             if (intVal !== '' && extNum > 0) {
                               const total = intNum + extNum;
                               displayTotal = total;
                               const gradeObj = getGrade(total);
                               gradeStr = gradeObj.g;
                               gradeColor = gradeObj.c;
                               
                               const isPass = total >= 50 && gradeStr !== 'F';
                               badgeText = isPass ? 'PASS' : 'FAIL';
                               badgeColor = isPass ? '#10b981' : '#ef4444';
                               badgeBg = isPass ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';
                             }

                             return (
                               <tr key={s.id}>
                                 <td><span className="badge badge-info">{s.id}</span></td>
                                 <td className="fw-700">{s.name}</td>
                                 <td>
                                   <input type="number" className="form-control" placeholder="-" style={{ padding: '6px 10px', width: '100%', height: '32px', margin: 0, border: '1px solid var(--border)' }} max={25} min={0} value={intVal} onChange={e => handleExtMarkChange(s.id, 'internal', e.target.value)} />
                                 </td>
                                 <td>
                                   <input type="number" className="form-control" placeholder="-" style={{ padding: '6px 10px', width: '100%', height: '32px', margin: 0, border: '1px solid var(--border)' }} max={75} min={0} value={extVal} onChange={e => handleExtMarkChange(s.id, 'external', e.target.value)} />
                                 </td>
                                 <td className="fw-700">{displayTotal}</td>
                                 <td><span style={{ fontWeight: 800, color: gradeColor, fontSize: 16 }}>{gradeStr}</span></td>
                                 <td>
                                   <span className="badge" style={{ background: badgeBg, color: badgeColor, border: 'none' }}>
                                     {badgeText}
                                   </span>
                                 </td>
                                </tr>
                             );
                           })
                         )}
                       </tbody>
                     </table>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px', borderTop: '1px solid var(--border)' }}>
                        <button className="btn btn-primary" onClick={handleSaveSubmit}>Save / Submit</button>
                     </div>
                   </div>
                 </div>
               );
             })() : (
                 <form onSubmit={submitStructuredMarks} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 16 }}>
                  {[['Reg No (e.g. 24MCA01)', 'student_id'], ['Course ID', 'course_id'], ['Semester', 'semester'], ['Marks Obtained', 'marks']].map(([label, key]) => (
                    <div key={key} className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">{label}</label>
                      <input type={key === 'marks' || key === 'semester' ? 'number' : 'text'} className="form-control" value={structuredForm[key]}
                        onChange={e => setStructuredForm(f => ({ ...f, [key]: e.target.value }))} required />
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                      {loading ? 'Saving...' : `Save ${activeTab}`}
                    </button>
                  </div>
                </form>
             )}
          </div>
        </div>
      )}

    </div>
  );
}
