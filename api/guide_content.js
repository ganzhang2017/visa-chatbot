// api/guide_content.js

import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js';

export async function getNotionPageContent() {
    try {
        const filePath = path.join(process.cwd(), 'assets', 'guide.pdf');
        const dataBuffer = fs.readFileSync(filePath);

        const data = await pdf(dataBuffer);

        if (!data.text) {
            throw new Error("Could not extract text from the PDF file.");
        }

        console.log("Successfully loaded content from PDF.");
        return data.text;
    } catch (error) {
        console.error('PDF Parsing Error:', error);
        return "";
    }
}