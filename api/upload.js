import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: ({ mimetype }) => {
        // Only allow PDF files
        return mimetype && mimetype.includes('pdf');
      },
    });

    const [fields, files] = await form.parse(req);
    
    const uploadedFile = files.resume?.[0];
    
    if (!uploadedFile) {
      return res.status(400).json({ 
        error: 'No file uploaded or file type not supported. Please upload a PDF file.' 
      });
    }

    // Check file type explicitly
    if (!uploadedFile.mimetype?.includes('pdf')) {
      return res.status(400).json({ 
        error: 'Only PDF files are allowed. Please upload a PDF resume.' 
      });
    }

    // For this demo, we'll just confirm upload success
    // In a real app, you'd process the PDF content here
    const fileInfo = {
      filename: uploadedFile.originalFilename,
      size: uploadedFile.size,
      type: uploadedFile.mimetype,
      uploadTime: new Date().toISOString()
    };

    // Optional: Clean up temp file
    try {
      await fs.promises.unlink(uploadedFile.filepath);
    } catch (cleanupError) {
      console.warn('Failed to clean up temp file:', cleanupError);
    }

    console.log('Resume uploaded successfully:', fileInfo);

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully!',
      file: fileInfo
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        error: 'File too large. Please upload a PDF file smaller than 10MB.' 
      });
    }
    
    if (error.code === 'LIMIT_FILE_TYPE') {
      return res.status(400).json({ 
        error: 'Invalid file type. Please upload a PDF file only.' 
      });
    }

    return res.status(500).json({ 
      error: 'Upload failed. Please try again with a valid PDF file.' 
    });
  }
}