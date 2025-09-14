// Replace your current upload.js content with:
import { Formidable } from 'formidable';
import pdf from 'pdf-parse/lib/pdf-parse.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new Formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to parse form data.' });
    }

    const file = files.resume?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    try {
      // Parse PDF content
      const dataBuffer = fs.readFileSync(file.filepath);
      const data = await pdf(dataBuffer);
      
      // Here you could store the resume content for later analysis
      console.log(`Processed resume: ${file.originalFilename}`);
      
      res.status(200).json({
        response: `Perfect! I've analyzed your resume "${file.originalFilename}". I can now provide personalized guidance based on your background. What aspect of the Global Talent Visa would you like to explore first?`
      });
    } catch (error) {
      console.error('PDF processing error:', error);
      res.status(500).json({ 
        response: `I've received your resume "${file.originalFilename}" but had trouble reading it. I can still help you with general Global Talent Visa questions!`
      });
    }
  });
}
