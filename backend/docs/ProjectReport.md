# PROJECT REPORT 
**SMART DEPARTMENT PORTAL**

**Submitted in partial fulfillment of the requirements for the final year project.**

**College**: Bharathidasan University, School of Computer Application & Engineering, Khajamalai Campus  
**Student**: Suga Priya R, Final Year MCA / MSc CS  
**Guide**: Dr. E. George Dharma Prakash Raj  

---

## 1. ACKNOWLEDGEMENT & CERTIFICATE

### CERTIFICATE
This is to certify that the project work entitled **"SMART DEPARTMENT PORTAL"** is a bonafide record of work carried out by **Suga Priya R** during the final year of the MCA/MSc CS program under the supervision and guidance of **Dr. E. George Dharma Prakash Raj** at the School of Computer Application & Engineering, Bharathidasan University, Khajamalai Campus. The work presented in this report has not been submitted elsewhere for any other degree or diploma.

### ACKNOWLEDGEMENT
The successful completion of this project represents a significant milestone in my academic journey, and I would like to take this opportunity to express my profound gratitude to all those who have supported me. 

First and foremost, I express my deepest gratitude to my esteemed project guide, **Dr. E. George Dharma Prakash Raj**, for their invaluable guidance, constant motivation, and continuous support throughout the development of this project. Their technical expertise and insightful feedback were crucial in shaping the portal into a robust and effective solution. 

I extend my sincere thanks to the Head of the Department and all the faculty members of the School of Computer Application & Engineering, Bharathidasan University, for providing a conducive environment for learning and research. I would also like to thank the college administration for furnishing the necessary infrastructure and resources required to carry out this work successfully.

Finally, I owe a deep debt of gratitude to my family and friends for their endless encouragement, patience, and moral support, which kept me motivated during challenging phases of development. I am also thankful to my peers for their constructive criticisms and collective troubleshooting efforts.

---

## 2. ABSTRACT

The **Smart Department Portal** is a comprehensive, full-stack, role-based web application designed to digitalize and streamline the academic and administrative operations of a university department. Built with a modern technology stack—React and Vite for a highly responsive frontend, Node.js and Express.js for a robust backend API, and a dual-database architecture utilizing local SQLite for zero-latency campus operations seamlessly synchronized with Supabase PostgreSQL for cloud-level resilience—this portal offers an unprecedented level of centralized management.

The system enforces strict role-based access control (RBAC), accommodating four distinct stakeholder roles: Admin, Staff, Student, and Alumni. The portal unifies previously fragmented workflows by offering a rich array of features. For students, it provides transparent access to their academic standing, including attendance tracking, marks management, a comprehensive repository of study materials, assignment submissions, real-time timetable viewing, campus notices, and event registrations. Furthermore, it incorporates modern innovations such as an AI-powered study assistant capable of generating personalized academic plans based on historical performance metrics.

For the teaching staff and administration, the portal serves as a powerful administrative tool. It digitizes daily operations by introducing a location-aware Geofenced Attendance system utilizing the Haversine formula and Leaflet.js, ensuring students can only mark their presence when physically located within campus coordinates. Staff can seamlessly enter marks, manage assignments, schedule events, and organize academic content. Admins benefit from an overarching Analytics Dashboard providing real-time geographical and statistical insights into department performance via dynamic charts and PDF export capabilities. Additionally, the platform integrates an Alumni Network to foster mentorship and placement coordination. By seamlessly deploying the frontend interface on Vercel and hosting the backend infrastructure on Render, the Smart Department Portal establishes a highly scalable, available, and technologically advanced cloud-native ecosystem that dramatically curtails manual administrative overhead while enhancing the educational experience.

---

## 3. ABOUT THE PROJECT

### 3.1 Existing System 
Traditionally, academic departments have relied heavily on manual data entry and fragmented digital methods to manage operations. The existing approach typically involves:
- **Manual Registers**: Attendance for students and staff is often recorded via physical logbooks or standalone biometric systems that do not integrate cleanly into a unified grading or analytics pipeline.
- **Spreadsheets and Disjointed Software**: Managing examination marks, timetable scheduling, and event registrations is often restricted to local Microsoft Excel spreadsheets managed by individual faculty members. This results in data silos, leading to synchronization issues and redundancy.
- **Lack of Centralized Communication**: Distributing study materials, assignment requirements, and critical departmental notices typically relies on informal communication channels (like WhatsApp groups or physical notice boards), causing information delivery to be inconsistent and difficult to track.
- **Absence of Alumni Engagement**: Past graduates and alumni lack a formal departmental platform to offer mentorship or share placement opportunities with current students.

### 3.2 Proposed System
The **Smart Department Portal** proposes a completely unified digital campus platform to supersede manual registries. The proposed system features:
- **Unified Digital Ecosystem**: A single web portal seamlessly integrating attendance, marks grading, document sharing, and announcements under an intuitive UI.
- **Role-Based Dashboards**: Customized interfaces depending on the authenticated user’s scope, ensuring a student only accesses their permitted academic data, while a staff member manages internal workflows, and an admin visualizes macro-level analytics.
- **Geofenced Operations**: Preventing proxy attendance by mathematically verifying a student's geographic coordinates against the department's authorized radius using precise geolocation APIs.
- **Artificial Intelligence Integration**: Giving students access to programmatic insight generators that process their academic standing and suggest tailored improvement guidelines.
- **Cloud Scalability**: Leveraging a hybrid local-cloud infrastructure wherein the local SQLite backend serves rapid on-campus needs, while a background protocol continuously synchronizes records to a cloud-hosted Supabase PostgreSQL database for remote failover and off-campus access.

---

## 4. DATA DICTIONARY

The underlying structured relational database comprises 23 securely normalized tables designed to minimize redundancy and uphold high constraints and data integrity:

1. **`users`**: Base authentication table.
   * `id` (INTEGER, Primary Key)
   * `user_id` (TEXT, Unique) – Registration number or Staff ID.
   * `name` (TEXT)
   * `email` (TEXT, Unique)
   * `password_hash` (TEXT)
   * `role` (TEXT) – ENUM ('admin', 'staff', 'student', 'alumni')

2. **`students`**: Extends users table for student specifics.
   * `id` (INTEGER, Primary Key)
   * `user_id` (INTEGER, Foreign Key referencing users.id)
   * `program` (TEXT)
   * `semester` (INTEGER)
   * `batch` (TEXT)

3. **`staff`**: Minimal staff record mapping.
   * `id` (INTEGER, Primary Key)
   * `user_id` (INTEGER, Foreign Key referencing users.id)
   * `department` (TEXT)

4. **`attendance`**: Daily generic/event attendance.
   * `id` (INTEGER, Primary Key)
   * `student_id` (INTEGER, Foreign Key)
   * `date` (DATE)
   * `status` (TEXT) - ENUM ('present', 'absent', 'late')
   * `course_id` (TEXT)

5. **`marks`**: Internal and External academic scores.
   * `id` (INTEGER, Primary Key)
   * `student_id` (INTEGER, Foreign Key)
   * `course_id` (TEXT)
   * `semester` (INTEGER)
   * `internal_marks` (INTEGER)
   * `external_marks` (INTEGER)
   * `total` (INTEGER)

6. **`timetable`**: Academic schedule tracking.
   * `id` (INTEGER, Primary Key)
   * `program` (TEXT)
   * `semester` (INTEGER)
   * `day` (TEXT)
   * `hour` (INTEGER)
   * `subject` (TEXT)
   * `staff_id` (INTEGER, Foreign Key)

7. **`notices`**: Global and targeted announcements.
   * `id` (INTEGER, Primary Key)
   * `title` (TEXT)
   * `content` (TEXT)
   * `posted_by` (INTEGER, Foreign Key)
   * `category` (TEXT)
   * `created_at` (TIMESTAMP)

8. **`events`**: Scheduled events and workshops.
   * `id` (INTEGER, Primary Key)
   * `title` (TEXT)
   * `description` (TEXT)
   * `event_date` (DATE)
   * `venue` (TEXT)
   * `type` (TEXT)

9. **`placements`**: Career and recruitment tracking.
   * `id` (INTEGER, Primary Key)
   * `company_name` (TEXT)
   * `role` (TEXT)
   * `package` (TEXT)
   * `drive_date` (DATE)

10. **`alumni`**: Extended properties for graduated students.
    * `id` (INTEGER, Primary Key)
    * `user_id` (INTEGER, Foreign Key referencing users.id)
    * `graduation_year` (INTEGER)
    * `current_company` (TEXT)
    * `current_role_title` (TEXT)
    
11. **`feedback`**: Anonymous and targeted faculty/course reviews.
    * `id` (INTEGER, Primary Key)
    * `user_id` (INTEGER, Foreign Key)
    * `target_type` (TEXT)
    * `target_id` (INTEGER)
    * `rating` (INTEGER)
    * `comments` (TEXT)

12. **`assignments`**: Academic tasks given by staff.
    * `id` (INTEGER, Primary Key)
    * `course_id` (TEXT)
    * `title` (TEXT)
    * `description` (TEXT)
    * `due_date` (DATETIME)
    * `created_by` (INTEGER, Foreign Key)

13. **`assignment_submissions`**: Student handover tracking.
    * `id` (INTEGER, Primary Key)
    * `assignment_id` (INTEGER, Foreign Key)
    * `student_id` (INTEGER, Foreign Key)
    * `file_path` (TEXT)
    * `submitted_at` (TIMESTAMP)
    * `grade` (TEXT)

14. **`study_materials`**: Digital repository files.
    * `id` (INTEGER, Primary Key)
    * `title` (TEXT)
    * `description` (TEXT)
    * `file_path` (TEXT)
    * `type` (TEXT)
    * `program` (TEXT)
    * `uploaded_by` (INTEGER, Foreign Key)

15. **`staff_details`**: Extended personal staff information.
    * `user_id` (INTEGER, Primary/Foreign Key)
    * `phone` (TEXT)
    * `address` (TEXT)
    * `qualification` (TEXT)
    * `experience_years` (INTEGER)
    * `specialization` (TEXT)

16. **`staff_documents`**: Safekeeping for staff credential files.
    * `id` (INTEGER, Primary Key)
    * `staff_id` (INTEGER, Foreign Key)
    * `document_name` (TEXT)
    * `file_path` (TEXT)

17. **`class_students`**: Specialized mapping for sub-divisions.
    * `id` (INTEGER, Primary Key)
    * `class_name` (TEXT)
    * `reg_no` (TEXT)
    * `student_name` (TEXT)

18. **`class_attendance`**: Granular period-by-period attendance.
    * `id` (INTEGER, Primary Key)
    * `class_name` (TEXT)
    * `subject` (TEXT)
    * `date` (DATE)
    * `reg_no` (TEXT)
    * `status` (TEXT)

19. **`staff_attendance`**: Tracking for faculty members.
    * `id` (INTEGER, Primary Key)
    * `staff_id` (INTEGER, Foreign Key)
    * `date` (DATE)
    * `status` (TEXT)
    * `marked_at` (TIMESTAMP)

20. **`event_registrations`**: Student-to-Event mapping table.
    * `event_id` (INTEGER, Foreign Key)
    * `user_id` (INTEGER, Foreign Key)
    * `registered_at` (TIMESTAMP)

21. **`notifications`**: Direct user messaging system.
    * `id` (INTEGER, Primary Key)
    * `user_id` (INTEGER, Foreign Key)
    * `title` (TEXT)
    * `message` (TEXT)
    * `is_read` (BOOLEAN)
    * `created_at` (TIMESTAMP)

22. **`exam_marks`**: Category specific exam scoring (Cycle Tests).
    * `id` (INTEGER, Primary Key)
    * `student_id` (TEXT)
    * `course_id` (TEXT)
    * `semester` (INTEGER)
    * `exam_type` (TEXT)
    * `marks` (INTEGER)

23. **`substitutions`**: Staff absence substitution requests.
    * `id` (INTEGER, Primary Key)
    * `absent_staff_id` (INTEGER, Foreign Key)
    * `substitute_staff_id` (INTEGER, Foreign Key)
    * `date` (DATE)
    * `hour` (INTEGER)
    * `status` (TEXT)

---

## 5. LOGICAL DEVELOPMENT

### 5.1 DFD Level 0 (Context Diagram)
The Level 0 Data Flow Diagram illustrates the Smart Department Portal as the central processing node. Four primary external entities interact with this system:
1. **Student**: Inputs login credentials, assignment file uploads, feedback text, and location data (for geofencing). Receives academic materials, grades, timetable arrays, and AI study plans.
2. **Staff**: Inputs marks arrays, attendance toggles, study material binaries, and assignment creation rules. Receives analytical insight formats and substitution requests.
3. **Admin**: Inputs user creation matrices and system configuration variables. Receives macro-level system usage reports and database logs.
4. **Alumni**: Inputs career updates and mentorship availability. Receives placement drive info and event notifications.

### 5.2 DFD Level 1
The Level 1 Diagram dissects the centralized process into primary sub-modules:
- **Process 1.0 (Auth Routing)**: Decrypts JWT and routes the user string to the respective Dashboard subsystem based on the Role identity flag.
- **Process 2.0 (Academic Execution)**: Connects Staff inputs to the `marks` and `attendance` DB entities, validating data integrity.
- **Process 3.0 (Resource Management)**: Handles binary data streams (PDFs, images) through `multer`, saving physical paths to `study_materials` and piping cloud-sync to Supabase Storage.
- **Process 4.0 (Location Validation)**: Ingests `HTML5 Geolocation API` inputs, processes them through the Haversine trigonometric function, and permits/denies `attendance` commits.

### 5.3 Entity Relationship (ER) Diagram Description
The ER mapping dictates strong enforcement rules: 
- A robust 1-to-1 relationship strictly binds `students`, `staff`, and `alumni` child tables to the master `users` authentication table to prevent orphan records.
- 1-to-Many relationships tie `users` to `attendance`, `marks`, and `event_registrations`, ensuring cascading deletions dynamically purge historical data if a user is struck from the system.
- Many-to-Many relationships between `students` and `events` are resolved via the junction table `event_registrations`.

### 5.4 System Architecture
The System Architecture strictly follows modern MVC (Model-View-Controller) separation adapted for a headless environment:
- **Client Tier**: A React 18 frontend utilizing Vite for high-speed module bundling. Client-side routing is strictly guarded by Context API wrapping to isolate route viewing based on JWT roles.
- **Logic Tier**: An Express.js backend fielding RESTful HTTP requests. Middleware intercepts all traffic to decode JSON Web Tokens (`jwt.verify`), guaranteeing secure transmission.
- **Data Tier**: A dynamically pivoting database layer. During local Node environments, requests stream into `better-sqlite3` for extreme sub-millisecond local latency. Using a specialized `database.js` abstraction wrapper, when pushed to the cloud (Vercel/Render), the architecture auto-switches to executing `async/await` commands against the Supabase PostgreSQL data layer using `@supabase/supabase-js`.

---

## 6. PROGRAM DESIGN

### 6.1 Authentication Module
The authentication layer relies heavily on stateless standard JWT (JSON Web Tokens). When a user supplies their `user_id` and `password`, the Node.js backend intercepts the strings, searches the database, and uses `bcryptjs.compareSync` to validate the salted password hash. Upon success, a signed token payload containing the user's role and database ID is generated. The React frontend caches this inside `localStorage` and embeds it as a `Bearer` token inside the `Authorization` header of all subsequent `apiFetch` HTTP wrappers.

### 6.2 Student Module
The student interface is specifically tailored for read-heavy consumption. Students render their current attendance percentage mapped aesthetically using CSS utility classes. The `Marks.jsx` logic intercepts internal and external mark thresholds natively, applying strict logical rendering: identifying `PASS` or `FAIL` dynamically based on integer calculations exceeding a threshold of 50, and triggering `PENDING` gray tags if a staff member hasn't yet submitted external examination evaluations. Students also interact with a dedicated Assignment dropbox, routing JavaScript `FormData` objects containing `.pdf` files through the network to the server's `multer` memory handlers.

### 6.3 Staff Module
Designed for write-heavy management, the Staff dashboard provisions dynamic data grids. Faculty can bulk-upload marks for an entire class simultaneously using mapped array interactions in React state. The Timetable subsystem allows staff to visualize their teaching hours cleanly via database joins cross-referencing the `staff_id` against the global schedule matrix.

### 6.4 Admin Module
Admins possess highly destructive and constructive powers handled through secure HTTP `DELETE` and `POST` routes securely wrapped by an `authMiddleware(['admin'])` block. Admins possess the exclusive capability to mass-register users through CSV imports parsing raw data directly into the SQLite tables, generating default passwords mathematically. They oversee overarching macro analytics via charting modules displaying department wellness ratios.

### 6.5 Alumni Module
Recognizing the necessity for career propagation, the Alumni scope permits graduated students to maintain active profiles detailing their corporate journeys (`current_company`, `current_role_title`). This feeds into the Placement sector, rendering a living network graph of where past university attendees have secured tenure, directly facilitating networking opportunities for current students accessing the Placement noticeboards.

### 6.6 AI Features 
Bridging the gap between standard CRUD interactions and modern intelligence, the backend features an `/api/analytics/atRisk` calculation endpoint. By parsing aggregated marks and attendance data, the backend utilizes standard algorithms to flag students dropping below safety thresholds. The frontend ingests these arrays to render natural language "Study Plan Generators", creating contextual English advice tailored to the specific statistical deficits of the viewing user.

### 6.7 Geofencing Attendance 
Perhaps the most academically rigorous physical security element implemented is the GPS Geofencing constraint.
- When an attendee attempts to mark their presence, the browser invokes `navigator.geolocation.getCurrentPosition()`.
- The frontend extracts the user's current latitude and longitude.
- It calculates the absolute distance in meters against the university's central hardcoded GPS coordinates using the Haversine trigonometric formula.
- If the result breaches the allowed campus radius (e.g., > 200 meters), the system throws a strict geometrical block, completely disallowing the API POST action to prevent remote proxy attendance.

### 6.8 Analytics Dashboard
Integrating dynamic React components, the `/dashboard` UI calculates overarching system health. Utilizing dynamic aggregation SQL (`SUM(CASE WHEN ... ELSE 0 END)`), it calculates grade distributions, mapping the count of 'O', 'A+', and 'B' grades into easy-to-read integer arrays for data visualization loops. Staff and Admins review these parameters dynamically, even allowing visual HTML-to-PDF export scripts for administrative physical printing.

---

## 7. TESTING

Standardization of performance is ensured via rigorous local testing structures executed prior to Vercel production deployment.

### 7.1 Unit Testing

| Test ID | Description | Input | Expected Output | Actual Output | Status |
|---------|-------------|-------|-----------------|---------------|--------|
| UT-01 | JWT Token Generation on valid login | Correct Admin ID & Password | Response 200 OK + JWT Token | 200 OK, valid token generated | PASS |
| UT-02 | Login Rejection on incorrect password | Correct ID, Invalid String PW | Response 401 Unauthorized | 401 Unauthorized block | PASS |
| UT-03 | RBAC Middleware rejection | Student JWT hitting Admin Route | Response 403 Forbidden | 403 Forbidden Access Denied | PASS |
| UT-04 | Geofencing Range Calculation | GPS Coords 500m away | Mathematical denial / Distance Error | Button disabled, Error shown | PASS |
| UT-05 | Geofencing Range Acceptance | GPS Coords 15m away | Math acceptance / Route Execution | Successful attendance post | PASS |
| UT-06 | File Upload constraints | Upload `.exe` file to Assignments | multer rejection due to mime restriction | 400 Bad Request | PASS |
| UT-07 | Calculate 'Total' Mark | Internal: 20, External: 60 | Renders '80' integer dynamically | Renders '80' | PASS |
| UT-08 | Mark PASS/FAIL validation | Internal 24, External 0 | State tags as 'PENDING' dynamically | Rejects premature PASS rendering | PASS |
| UT-09 | CSV Bulk User Parsing | Valid standard CSV format | Database loops inserts without crash | HTTP 201 Inserted | PASS |
| UT-10 | Notice board retrieval | HTTP GET `/api/notices` | JSON array of notice objects | Ordered JSON array mapping | PASS |

### 7.2 Integration Testing

| Test ID | Description | Dependencies | Expected Output | Status |
|---------|-------------|--------------|-----------------|--------|
| IT-01 | Cloud Database Synchronizer | API Server ↔ Supabase Engine | Local insertions flawlessly mirror to Supabase | PASS |
| IT-02 | File Cloud Storage Pipe | Multer memory ↔ Supabase Storage bucket | Physical binaries stream cleanly to cloud HTTP links | PASS |
| IT-03 | Dual Configuration Router | Node Env Prod flag ↔ Supabase Client wrapper | Vercel frontend natively fetches cloud data tables directly | PASS |
| IT-04 | Profile Aggregation Merge | Users Table ↔ Staff_Details Table | Completing a profile merges 2 disjointed table arrays | PASS |
| IT-05 | Client-Side Route Guards | React Router ↔ LocalStorage `user.role` | URL tampering forcefully redirects users to Dashboard | PASS |

### 7.3 UAT (User Acceptance Testing)
User Acceptance Testing was manually simulated simulating the workflow of the standard university staff member. 
1. **Login Flow**: Upon accessing the cloud URL, users input 'BDU' prefixes to log in seamlessly over standard HTTP lines.
2. **Marks Entry**: Faculties successfully simulated entering arrays of student marks directly into grid interfaces. The asynchronous save procedures reacted securely.
3. **Responsive Readability**: Simulated on mobile environments (Chrome for Android), verifying the sidebar toggles smoothly and tables horizontally scroll instead of vertically breaking CSS limits.

---

## 8. CONCLUSION & REFERENCES

### Conclusion
The Smart Department Portal definitively resolves the fragmented administrative struggles plaguing modern educational faculty. By executing a strict migration from physical, pen-and-paper management protocols to a unified React-driven, cloud-backed centralized ecosystem, the department dramatically decreases time-to-delivery for announcements, guarantees cryptographic safety for grade manipulations, and provides an unprecedented degree of automated analytic oversight. The utilization of AI study planning and geographical algorithmic fencing positions this project as a robust, forward-facing framework capable of scaling endlessly within the academic sphere. 

### References
1. Documentation. React JS. [https://reactjs.org/docs](https://reactjs.org/docs)
2. Documentation. Node.js Foundation. [https://nodejs.org/en/docs/](https://nodejs.org/en/docs/)
3. Framework Documentation. Express.js. [https://expressjs.com/](https://expressjs.com/)
4. Data management protocols. SQLite / Better-SQLite3. [https://github.com/WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
5. Cloud Infrastructure. Supabase. [https://supabase.com/docs](https://supabase.com/docs)
6. Specifications. JSON Web Tokens (RFC 7519). [https://jwt.io/](https://jwt.io/)
7. Geolocation mathematics: Haversine Trigonometry standards.
8. Bundling logic: Vite Javascript build tool. [https://vitejs.dev/](https://vitejs.dev/)

---

## 9. APPENDIX

**Full source code available at GitHub: https://github.com/sugapriyamsccs26-dot/smart-department-portal**

*The following represent highly critical execution blocks governing the project's specialized capabilities.*

### A. Server Cloud Hybrid Setup & CORS (server.js)
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Secure origin allowance for Vercel rendering targets explicitly
app.use(cors({
  origin: [
    'https://sdportal-pi.vercel.app',
    'https://sdportal.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ], 
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '400mb' }));
// Dual DB wrapper injected via config
app.use('/api/auth', require('./routes/auth'));
app.use('/api/analytics', require('./routes/analytics'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serving active cloud instances on ${PORT}`));
```

### B. Secure JWT RBAC Middleware (auth.js)
```javascript
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-development';

function authMiddleware(allowedRoles = []) {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized: Missing execution token.' });

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Bind payload strictly to server request

            if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Forbidden: Security compliance layer blocked role interaction.' });
            }
            next(); // Allow passthrough to sensitive DB functions
        } catch (err) {
            res.status(401).json({ message: 'Invalid or expired cryptographic token.' });
        }
    };
}
```

### C. Client Geofencing Mathematical Verifier (Attendance.jsx)
```javascript
const CAMPUS_COORDS = { lat: 10.7904833, lng: 78.704675 }; // BDU Campus
const ALLOWED_RADIUS = 200; // Physical boundary limit in meters

// Haversine core math function
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Constants of Earth's radius
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(dp/2) * Math.sin(dp/2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Intercepts browser GPS mapping logic instantly
navigator.geolocation.getCurrentPosition(
  pos => {
    const dist = getDistance(pos.coords.latitude, pos.coords.longitude, CAMPUS_COORDS.lat, CAMPUS_COORDS.lng);
    if (dist <= ALLOWED_RADIUS) {
      setGeoStatus({ text: `Within campus physical constraints (${Math.round(dist)}m)`, ok: true });
    } else {
      setGeoStatus({ text: `Location Rejected: You are ${Math.round(dist)}m away from campus.`, ok: false });
    }
  }
);
```

### D. Production Dual-Database Pivot Router (analytics.js implementation)
```javascript
// Automatically shifts processing logic seamlessly between fast SQLite & Remote Supabase Postgre instances
router.get('/dashboard', authMiddleware(), async (req, res) => {
    try {
        const { id: userDbId, user_id, role } = req.user;
        const dbConfig = require('../config/database');

        if (dbConfig.isProduction) {
            // Live Cloud environment executes purely through non-blocking HTTP REST vectors mapping to raw PostgreSQL structures
            const [{ data: notices }, { data: events }] = await Promise.all([
                dbConfig.supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(4),
                dbConfig.supabase.from('events').select('*').order('event_date', { ascending: true }).limit(4)
            ]);
            return res.json({ notices: notices || [], events: events || []});
        }

        // Dedicated local fallback for isolated environment structures maintaining maximum offline up-time capacity mapped via pure SQLite sync
        const notices = dbConfig.db.prepare("SELECT * FROM notices ORDER BY created_at DESC LIMIT 4").all();
        const events = dbConfig.db.prepare("SELECT * FROM events ORDER BY event_date ASC LIMIT 4").all();

        res.json({ notices, events });
    } catch (err) {
        console.error('Database Sync Route Error:', err);
        res.status(500).json({ message: 'Routing processing fault' });
    }
});
```
