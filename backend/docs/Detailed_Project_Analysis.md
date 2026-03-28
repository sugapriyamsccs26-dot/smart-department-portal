# Project Documentation: Smart Department Portal

This documentation provides a comprehensive breakdown of the modules, files, and testing procedures used in the Smart Department Portal project.

## 1. Project Modules & Key Dependencies

This project is built using a modern full-stack architecture with a focus on cloud synchronization and geofenced operations.

### **Backend (Node.js & Express)**
The backend manages the API and database synchronization between local SQLite and cloud-hosted Supabase PostgreSQL.

| Module | Purpose |
| :--- | :--- |
| **Express.js** | Core API framework for routing and middleware. |
| **Better-SQLite3** | Primary local database for fast campus access. |
| **@supabase/supabase-js** | Handles real-time cloud database synchronization. |
| **Firebase Admin SDK** | Manages cloud functions and push notifications. |
| **JWT (JsonWebToken)** | Secure, stateless authentication with Role-Based Access Control (RBAC). |
| **BcryptJS** | Secure password hashing for encrypted storage. |
| **Multer** | Middleware for handling file uploads (Assignments/Materials). |
| **Marked** | Converts Markdown content into HTML for study resources. |
| **HTML-to-DOCX** | Generates Word documents from HTML reports. |

### **Frontend (React & Vite)**
The frontend offers a user-responsive interface using modern state management and UI components.

| Module | Purpose |
| :--- | :--- |
| **React 18** | Core library for component-based UI development. |
| **Vite** | Fast build tool and module bundler. |
| **Leaflet / React-Leaflet** | Powers GPS map integration for Geofenced attendance. |
| **Recharts** | Generates interactive charts for the Analytics Dashboard. |
| **Firebase JS SDK** | Facilitates direct cloud communications from the browser. |

---

## 2. Main Entry Points (Main Modules)

*   **Backend Main Module**: `backend/server.js` 
    - This file is the primary entry point for the backend server. It initializes environment variables, connects to the database, and sets up the Express API routes.
*   **Frontend Main Module**: `frontend/src/main.jsx`
    - This is the entry point for the React application, which initializes the frontend and handles the root rendering into the `index.html`.

---

## 3. Detailed File Structure

### **Backend Directory (`/backend`)**
*   `server.js`: The heart of the API server.
*   `db.js`: Handles database connections (SQLite + Supabase config).
*   `routes/`: Modular endpoints for `auth`, `attendance`, `marks`, `notices`, `assignments`, etc.
*   `middleware/`: Security logic for role validation (e.g., `authMiddleware`).
*   `uploads/`: Local directory for storage of student submissions and materials.
*   `docs/`: Contains project reports and documentation markdown files.

### **Frontend Directory (`/frontend/src/pages`)**
Key functional components that represent the portal's pages:
*   `Login.jsx`: Multi-role login logic.
*   `Dashboard.jsx`: Role-specific overview for Students, Staff, and Admins.
*   **`Attendance.jsx`**: Logic for marking attendance with Geofenced coordinate verification.
*   **`Marks.jsx`**: Interface for viewing and entering internal/external marks.
*   **`Analytics.jsx`**: Data visualization tool for academic performance.
*   **`Timetable.jsx`**: Displays academic schedules using CSS grids.

---

## 4. Testing Procedure

The project undergoes three rigorous testing phases to ensure security and reliability:

### **Phase 1: Unit Testing (UT)**
Testing individual functions and data logic:
- **UT-01**: Verifying that a correct login generates a JWT token.
- **UT-02**: Testing that incorrect passwords result in a `401 Unauthorized` response.
- **UT-03**: Verifying that the **Haversine Formula** successfully detects distance from campus coordinates.
- **UT-04**: Checking that role-based guards block students from attempting admin-level deletions.

### **Phase 2: Integration Testing (IT)**
Testing how different system components work together:
- **IT-01 (Cloud Sync)**: Verifying that changes to the local SQLite database are successfully mirrored to the Supabase cloud PostgreSQL.
- **IT-02 (Storage)**: Ensuring that files uploaded via the assignment portal are correctly stored and retrieved from the binary file system.
- **IT-03 (Security Flow)**: Confirming that the JWT token is passed in headers for all subsequent API calls after login.

### **Phase 3: User Acceptance Testing (UAT)**
Testing real-world workflows:
- **Staff Workflow**: Entering a batch of marks and ensuring they render correctly on the student dashboard.
- **Student Workflow**: Marking attendance on a mobile device and verifying GPS coordinate acceptance.
- **Responsiveness**: Testing UI layout and button functionality on various screen sizes (Mobile, Tablet, Desktop).
