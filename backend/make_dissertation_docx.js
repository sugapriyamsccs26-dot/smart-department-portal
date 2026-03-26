const fs = require('fs');
const path = require('path');
const generateDocx = require('html-to-docx');
const { marked } = require('marked');

async function createDissertationDoc() {
    console.log('🏗️  Generating Dissertation DOCX...');

    const mdPath = path.join(__dirname, '../SMART_DEPT_PORTAL_DISSERTATION.md');
    if (!fs.existsSync(mdPath)) {
        console.error('❌ MD file not found!');
        return;
    }

    const mdContent = fs.readFileSync(mdPath, 'utf8');
    
    // Convert MD to HTML
    const htmlBody = marked.parse(mdContent);

    const htmlString = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5;">
            ${htmlBody}
        </body>
        </html>
    `;

    const options = {
        title: 'Project Dissertation - Smart Department Portal',
        orientation: 'portrait',
        margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch margins
        footer: true,
        pageNumber: true,
    };

    try {
        const docxBuffer = await generateDocx(htmlString, null, options);
        const outPath = path.join(__dirname, '../SMART_DEPT_PORTAL_DISSERTATION.docx');
        fs.writeFileSync(outPath, docxBuffer);
        console.log('✅  Dissertation DOCX created successfully!');
    } catch (err) {
        console.error('❌  DOCX Generation Error:', err);
    }
}

createDissertationDoc();
