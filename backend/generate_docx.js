const fs = require('fs');
const path = require('path');
const generateDocx = require('html-to-docx');

async function createTechnicalDoc() {
    console.log('🏗️  Generating Technical Code Document...');

    // 1. Fetch source codes
    const dbCode = fs.readFileSync(path.join(__dirname, 'db.js'), 'utf8');
    const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    const apiCode = fs.readFileSync(path.join(__dirname, '../frontend/src/api.js'), 'utf8');
    const loginPageCode = fs.readFileSync(path.join(__dirname, '../frontend/src/pages/Login.jsx'), 'utf8');

    // 2. Wrap them in nice HTML
    const htmlString = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Smart Department Portal - Technical Source Code</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif;">
            <h1 style="color: #6C63FF; text-align: center;">Smart Department Portal</h1>
            <h2 style="text-align: center; color: #555;">Full Stack Technical Implementation Document</h2>
            <hr />

            <div style="margin-top: 30px;">
                <h3 style="background-color: #F3F4F6; padding: 10px; color: #333;">1. Database Layer (SQLite Schema & Seeding)</h3>
                <p>This section shows the <code>db.js</code> initialization logic using <b>better-sqlite3</b>, including the relational schema for users, students, staff, attendance, and marks.</p>
                <div style="background-color: #F9FAFB; padding: 15px; border: 1px solid #E5E7EB; border-radius: 5px; font-family: 'Consolas', monospace; font-size: 11px;">
                    <pre>${dbCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </div>
            </div>

            <div style="page-break-before: always; margin-top: 30px;">
                <h3 style="background-color: #F3F4F6; padding: 10px; color: #333;">2. Backend Layer (Express.js REST Server)</h3>
                <p>This is the <code>server.js</code> file which acts as the entry point, handling CORS, JSON body parsing, and route mounting for the entire REST API.</p>
                <div style="background-color: #F9FAFB; padding: 15px; border: 1px solid #E5E7EB; border-radius: 5px; font-family: 'Consolas', monospace; font-size: 11px;">
                    <pre>${serverCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </div>
            </div>

            <div style="page-break-before: always; margin-top: 30px;">
                <h3 style="background-color: #F3F4F6; padding: 10px; color: #333;">3. Frontend API Layer (Unified Fetch Wrapper)</h3>
                <p>The <code>api.js</code> helper centralizes all REST calls, handles automatic JWT header injection, and resolves the correct backend <b>API_ROOT</b> dynamically for local and cloud environments.</p>
                <div style="background-color: #F9FAFB; padding: 15px; border: 1px solid #E5E7EB; border-radius: 5px; font-family: 'Consolas', monospace; font-size: 11px;">
                    <pre>${apiCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </div>
            </div>

            <div style="page-break-before: always; margin-top: 30px;">
                <h3 style="background-color: #F3F4F6; padding: 10px; color: #333;">4. Frontend Page Layer (React Component Example)</h3>
                <p>An example of a robust React component (<code>Login.jsx</code>) demonstrating state management, forms handling, and multi-role redirection logic.</p>
                <div style="background-color: #F9FAFB; padding: 15px; border: 1px solid #E5E7EB; border-radius: 5px; font-family: 'Consolas', monospace; font-size: 11px;">
                    <pre>${loginPageCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </div>
            </div>

            <hr style="margin-top: 50px;" />
            <p style="text-align: center; font-size: 10px; color: #777;">
                Smart Department Portal Implementation | 2024–2026 | Bharathidasan University
            </p>
        </body>
        </html>
    `;

    // 3. Convert HTML to DOCX using options
    const options = {
        title: 'Smart Department Portal - Source Code',
        orientation: 'portrait',
        margins: { top: 720, right: 720, bottom: 720, left: 720 },
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
    };

    try {
        const docxBuffer = await generateDocx(htmlString, null, options);
        fs.writeFileSync(path.join(__dirname, 'Smart_Department_Portal_Technical_Code.docx'), docxBuffer);
        console.log('✅  DOCX created: Smart_Department_Portal_Technical_Code.docx');
    } catch (err) {
        console.error('❌  DOCX Generation Error:', err);
    }
}

createTechnicalDoc();
