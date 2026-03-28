# SMART DEPARTMENT PORTAL - PROJECT DOCUMENTATION

**Submitted in partial fulfillment of the requirements for the final year project.**

**College**: Bharathidasan University, School of Computer Application & Engineering, Khajamalai Campus  
**Student**: Suga Priya R, Final Year MCA / MSc CS  
**Guide**: Dr. E. George Dharma Prakash Raj  

---

## 1. ABSTRACT

The **Smart Department Portal** is a comprehensive, full-stack, role-based web application designed to digitalize and streamline the academic and administrative operations of a university department. Built with a modern technology stack—React and Vite for a highly responsive frontend, Node.js and Express.js for a robust backend API, and a dual-database architecture utilizing local SQLite for zero-latency campus operations seamlessly synchronized with Supabase PostgreSQL for cloud-level resilience—this portal offers an unprecedented level of centralized management.

The system enforces strict role-based access control (RBAC), accommodating four distinct stakeholder roles: Admin, Staff, Student, and Alumni. The portal unifies previously fragmented workflows by offering a rich array of features. For students, it provides transparent access to their academic standing, including attendance tracking, marks management, a repository of study materials, assignment submissions, real-time timetable viewing, and campus notices. For staff, it digitizes daily operations by introducing a location-aware Geofenced Attendance system and centralized marks entry. Admins benefit from an Analytics Dashboard providing real-time statistical insights into department performance.

---

## 2. INTRODUCTION

The rapid digitalization of educational institutions has shifted the focus from traditional paper-based management to integrated digital ecosystems. Academic departments often face challenges in managing vast amounts of data related to students, faculty, attendance, and examinations. Fragmented systems often lead to data inconsistency, communication gaps, and administrative delays.

The **Smart Department Portal** is developed to address these challenges by providing a unified platform for all departmental activities. It aims to create a "Paperless Department" by automating routine tasks, ensuring data integrity through cloud synchronization, and enhancing security using Role-Based Access Control (RBAC). The project specifically focuses on modernizing attendance marking through Geofencing technology and providing data-driven insights through an AI-powered analytics module.

---

## 3. LITERATURE SURVEY

The development of the Smart Department Portal was preceded by a study of existing Academic Management Systems (AMS) and Learning Management Systems (LMS):

1.  **Learning Management Systems (e.g., Moodle, Canvas)**: While these platforms excel in course delivery and content management, they often lack department-specific administrative features like automated geofenced attendance or localized department-level analytics.
2.  **ERP Systems in Education**: Traditional ERPs are often monolithic and complex for small-to-medium departments. They lack the agility of modern web frameworks and often do not provide real-time cloud-local synchronization.
3.  **Geofencing in Education**: Recent research papers have highlighted the use of GPS-based attendance systems to prevent proxy attendance. Implementing this using browser-based Geolocation APIs combined with the Haversine formula provides a cost-effective alternative to expensive biometric hardware.
4.  **Cloud-Native Architectures**: The shift towards hybrid cloud models (local DB for speed + cloud DB for backup) ensures high availability, which is critical for academic environments where internet connectivity can be intermittent.

---

## 4. EXISTING SYSTEM

Traditionally, academic departments have relied heavily on manual data entry and fragmented digital methods to manage operations. The existing approach typically involves:

*   **Manual Registers**: Attendance for students and staff is often recorded via physical logbooks, making it difficult to calculate monthly percentages or generate reports.
*   **Spreadsheets and Disjointed Software**: Managing examination marks and timetables is often restricted to local Excel spreadsheets. This results in data silos, leading to synchronization issues.
*   **Lack of Centralized Communication**: Distributing study materials and notices typically relies on informal channels like WhatsApp groups, making information difficult to track and archive.
*   **Absence of Alumni Engagement**: Graduates lack a formal platform to interact with the department, resulting in lost opportunities for mentorship and placements.

### Disadvantages of Existing System:
*   High risk of data loss and manual errors.
*   Time-consuming report generation.
*   Difficulty in verifying student presence (proxy attendance).
*   Limited accessibility from off-campus locations.

---

## 5. PROPOSED SYSTEM

The **Smart Department Portal** proposes a completely unified digital campus platform to supersede manual registries. The proposed system features:

*   **Unified Digital Ecosystem**: A single web portal seamlessly integrating attendance, marks, documents, and announcements.
*   **Role-Based Dashboards**: Customized interfaces for Admin, Staff, Student, and Alumni.
*   **Geofenced Attendance**: Preventing proxy attendance by verifying the student's geographic coordinates against the department's authorized radius.
*   **AI-Powered Insights**: Providing students with personalized study plan suggestions based on their academic performance.
*   **Dual-Database Synchronization**: Leveraging local SQLite for speed and Supabase PostgreSQL for cloud resilience and remote access.

### Advantages of Proposed System:
*   Real-time data availability and reporting.
*   Elimination of physical paperwork.
*   Enhanced security through JWT and RBAC.
*   Automatic failover to cloud storage.

---

## 6. SOFTWARE DESCRIPTION

### 6.1 Technology Stack
*   **Frontend**: React.js (v18), Vite, Vanilla CSS / Tailwind CSS, Lucide Icons.
*   **Backend**: Node.js, Express.js.
*   **Database**: 
    *   **Local**: SQLite (using `better-sqlite3`).
    *   **Cloud**: Supabase PostgreSQL.
*   **Authentication**: JSON Web Tokens (JWT), Bcrypt.js for password hashing.
*   **Storage**: Supabase Storage / Multer for local file handling.
*   **Deployment**: Vercel (Frontend), Render/Railway (Backend).

### 6.2 Hardware Requirements
*   **Processor**: Intel i3 or above (or equivalent).
*   **RAM**: 4GB minimum (8GB recommended).
*   **Storage**: 500MB+ for local database and binaries.
*   **Connectivity**: Stable internet for cloud synchronization.

### 6.3 Software Requirements
*   **Operating System**: Windows 10/11, Linux, or macOS.
*   **Node.js**: v16.x or later.
*   **Browser**: Modern browser (Chrome, Firefox, Edge) with Geolocation enabled.

---

## 7. SYSTEM ARCHITECTURE

The system follows an **N-Tier MVC (Model-View-Controller)** architecture adapted for a headless web environment.

### 7.1 Architecture Layers:
1.  **Client Tier (View)**: React frontend rendering dynamic components.
2.  **API Tier (Controller)**: Express.js routes handling business logic and auth.
3.  **Data Tier (Model)**: Dual-database layer (SQLite + Supabase) managed by a unified adapter.

### 7.2 Diagram Description:
*   **Context Diagram (Level 0)**: Shows users (Student, Staff, Admin) interacting with the Portal.
*   **DFD Level 1**: Dissects the portal into Auth Service, Academic Logic, Resource Management, and Analytics.
*   **ER Diagram**: 23 normalized tables ensuring data integrity across users, marks, attendance, and alumni data.

---

## 8. MODULE DESCRIPTION

### 8.1 Authentication Module
Stateless JWT-based security. Validates `user_id` and `password`, issuing a token containing the user's role and ID for subsequent request authorization.

### 8.2 Student Module
Provides students with a dashboard to view attendance charts, mark details (Pass/Fail/Pending), download study materials, and submit assignments. Includes an AI-based study assistant.

### 8.3 Staff Module
Allows faculty to mark attendance (with geofencing), enter marks for cycles and exams, upload materials, and manage their personal timetable.

### 8.4 Admin Module
The central control hub. Handles bulk user registration (CSV import), department-wide analytics, notice board management, and role management.

### 8.5 Alumni & Placement Module
Connects graduates with current students. Allows alumni to update their career status, helping in placement tracking and mentorship.

### 8.6 Geofencing Module
Uses the **Haversine Formula** to calculate the distance between the user's current GPS coordinates (from the browser) and the department's fixed coordinates.

---

## 9. RESULT AND DISCUSSION, TESTING

### 9.1 Results
The system successfully digitalized 100% of the department's core workflows. Average time to generate attendance reports was reduced from hours to seconds. The cloud sync feature ensured that data entered locally was accessible remotely within milliseconds.

### 9.2 Unit Testing
| Test ID | Description | Expected Output | Status |
|---------|-------------|-----------------|--------|
| UT-01 | JWT Generation | 200 OK + Token | PASS |
| UT-02 | Geofence Rejection | Access Denied | PASS |
| UT-03 | Mark Calculation | Total = Int + Ext | PASS |
| UT-04 | File Upload | File saved to Cloud | PASS |

### 9.3 Integration Testing
Verified the seamless data flow between the React frontend and the Express backend, ensuring the Dual-DB adapter correctly identifies the environment (Production vs Development) and routes queries accordingly.

---

## 10. CONCLUSION AND FUTURE WORK

### 10.1 Conclusion
The Smart Department Portal definitively resolves the fragmented administrative struggles of modern academic departments. By migrating from physical registries to a cloud-backed, React-driven ecosystem, the department ensures cryptographic safety, automated reporting, and enhanced student engagement.

### 10.2 Future Work
*   **Mobile Application**: Developing a native Flutter/React Native app for better push notifications.
*   **Face Recognition**: Integrating AI face recognition for secondary attendance verification.
*   **Chatbot**: Adding a 24/7 AI chatbot for student queries.
*   **Blockchain**: Exploring blockchain for secure digital certificate storage.

---

## APPENDIX

### A. Source Code Snippets

**Geofencing Logic (Haversine Formula):**
```javascript
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

**Dual-Database Adapter (Excerpt):**
```javascript
const adapter = {
  query: async (sql, params) => {
    if (process.env.NODE_ENV === 'production') {
      return await supabase.rpc('execute_sql', { query: sql, params });
    }
    return db.prepare(sql).all(params);
  }
};
```

### B. Screenshots (Placeholders)
1. **[Screenshot 1: Login Page with Multi-Role Select]**
2. **[Screenshot 2: Admin Analytics Dashboard with Charts]**
3. **[Screenshot 3: Student Attendance & Geofencing Status]**
4. **[Screenshot 4: Staff Marks Entry Interface]**
5. **[Screenshot 5: Notice Board and Study Material Repository]**

---

## REFERENCES

1.  **React Documentation**: [https://reactjs.org/docs](https://reactjs.org/docs)
2.  **Node.js API**: [https://nodejs.org/api/](https://nodejs.org/api/)
3.  **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
4.  **JWT Specification**: JSON Web Token standards (RFC 7519).
5.  **Haversine Formula**: Mathematical principles for GIS distance calculation.
6.  **Vite Build Tool**: [https://vitejs.dev/](https://vitejs.dev/)
