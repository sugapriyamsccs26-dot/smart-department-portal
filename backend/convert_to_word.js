const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const HTMLToDOCX = require('html-to-docx');

async function convert() {
    try {
        const mdPath = path.join(__dirname, 'docs', 'ProjectReport.md');
        const docxPath = path.join(__dirname, 'docs', 'ProjectReport.docx');
        
        console.log('Reading Markdown...');
        const mdContent = fs.readFileSync(mdPath, 'utf-8');
        
        console.log('Converting to HTML...');
        // Add basic CSS styling inline for standard layout spacing
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <style>
                    body { font-family: "Calibri", sans-serif; line-height: 1.5; font-size: 14pt; }
                    h1 { color: #2c3e50; text-align: center; }
                    h2 { color: #34495e; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; margin-top: 20px; }
                    h3 { color: #555; }
                    p { text-align: justify; margin-bottom: 12px; }
                    table { border-collapse: collapse; width: 100%; border: 1px solid black; }
                    th, td { border: 1px solid black; padding: 8px; text-align: left; }
                    pre { background: #f8f9fa; padding: 10px; border: 1px solid #dee2e6; }
                    hr { break-after: page; }
                </style>
            </head>
            <body>
                ${marked.parse(mdContent)}
            </body>
            </html>
        `;

        console.log('Generating DOCX...');
        const fileBuffer = await HTMLToDOCX(htmlContent, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });

        fs.writeFileSync(docxPath, fileBuffer);
        console.log(`Success! Word Document saved at: ${docxPath}`);
    } catch (err) {
        console.error('Error:', err);
    }
}

convert();
