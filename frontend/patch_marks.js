const fs = require('fs');

try {
  let code = fs.readFileSync('src/pages/Marks.jsx', 'utf8');

  // Insert constants before 'export default function Marks'
  if (!code.includes('EXT_CLASSES_STUDENTS')) {
    const constants = `
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

`;
    code = code.replace('export default function Marks({ user }) {', constants + 'export default function Marks({ user }) {');

    const componentState = `
  const ObjectKeysCls = Object.keys(EXT_CLASSES_STUDENTS);
  const [extClass, setExtClass] = useState(ObjectKeysCls[0]);
  const [extExam, setExtExam] = useState(EXT_EXAMS[0]);
  const [extSubject, setExtSubject] = useState(EXT_SUBJECTS[ObjectKeysCls[0]][0]);
  const [extMarksData, setExtMarksData] = useState({});
  const [extSearch, setExtSearch] = useState('');

  useEffect(() => {
    setExtSubject(EXT_SUBJECTS[extClass][0]);
  }, [extClass]);

  useEffect(() => {
    if (!extClass || !extExam || !extSubject) return;
    const key = \`\${extClass}_\${extExam}_\${extSubject}\`;
    try {
      const saved = localStorage.getItem(key);
      setExtMarksData(saved ? JSON.parse(saved) : {});
    } catch { setExtMarksData({}); }
  }, [extClass, extExam, extSubject]);

  function handleExtMarkChange(id, field, val) {
    const numericVal = val === '' ? '' : Number(val);
    setExtMarksData(prev => {
      const nextData = { ...prev, [id]: { ...(prev[id] || {}), [field]: numericVal } };
      localStorage.setItem(\`\${extClass}_\${extExam}_\${extSubject}\`, JSON.stringify(nextData));
      return nextData;
    });
  }
`;

    code = code.replace(/const isStaffOrAdmin = user\.role === 'staff' \|\| user\.role === 'admin';\n\n  useEffect\(\(\) => \{/g, `const isStaffOrAdmin = user.role === 'staff' || user.role === 'admin';\n\n${componentState}\n\n  useEffect(() => {`);

    const uiStr = `{activeTab === 'Enter Marks' ? (() => {
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
                           <th style={{ width: 130 }}>Internal (40)</th>
                           <th style={{ width: 130 }}>External (60)</th>
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
                             const total = (d.internal || 0) + (d.external || 0);
                             const { g, c } = getGrade(total);
                             const isPass = total >= 50;

                             return (
                               <tr key={s.id}>
                                 <td><span className="badge badge-info">{s.id}</span></td>
                                 <td className="fw-700">{s.name}</td>
                                 <td>
                                   <input type="number" className="form-control" placeholder="-" style={{ padding: '6px 10px', width: '100%', height: '32px', margin: 0, border: '1px solid var(--border)' }} max={40} min={0} value={intVal} onChange={e => handleExtMarkChange(s.id, 'internal', e.target.value)} />
                                 </td>
                                 <td>
                                   <input type="number" className="form-control" placeholder="-" style={{ padding: '6px 10px', width: '100%', height: '32px', margin: 0, border: '1px solid var(--border)' }} max={60} min={0} value={extVal} onChange={e => handleExtMarkChange(s.id, 'external', e.target.value)} />
                                 </td>
                                 <td className="fw-700">{total}</td>
                                 <td><span style={{ fontWeight: 800, color: c, fontSize: 16 }}>{g}</span></td>
                                 <td>
                                   <span className="badge" style={{ background: isPass ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isPass ? '#10b981' : '#ef4444', border: 'none' }}>
                                     {isPass ? 'Pass' : 'Fail'}
                                   </span>
                                 </td>
                               </tr>
                             );
                           })
                         )}
                       </tbody>
                     </table>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px', borderTop: '1px solid var(--border)' }}>
                        <button className="btn btn-primary" onClick={() => setMsg('Progress automatically saved to local storage!')}>Auto-Saved ✅</button>
                     </div>
                   </div>
                 </div>
               );
             })()
             ) : (`;

    let start = code.indexOf("{activeTab === 'Enter Marks' ? (");
    let end = code.indexOf(") : (\n                // Add-On: Structured Form");
    if (start === -1 || end === -1) {
        console.error('Could not find replace targets');
    } else {
        code = code.substring(0, start) + uiStr + code.substring(end + 6);
        fs.writeFileSync('src/pages/Marks.jsx', code);
        console.log('Marks.jsx fully updated.');
    }
  } else {
    console.log('Already updated');
  }
} catch (e) {
  console.error(e);
}
