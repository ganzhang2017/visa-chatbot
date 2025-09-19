// api/upload.js - Enhanced PDF upload handler with text extraction
import formidable from 'formidable';
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { createClient } from "@vercel/kv";

// Initialize KV client for storing extracted content
let kv = null;
if (process.env.UPSTASH_REDIS_URL && process.env.REDIS_TOKEN) {
    try {
        kv = createClient({
            url: process.env.UPSTASH_REDIS_URL,
            token: process.env.REDIS_TOKEN,
        });
        console.log('✅ KV client initialized for upload handler');
    } catch (error) {
        console.warn('⚠️ KV client initialization failed:', error.message);
        kv = null;
    }
}

// Disable default body parser for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

// Extract text from PDF buffer
async function extractTextFromPDF(buffer) {
    try {
        console.log(`📖 Extracting text from PDF buffer (${buffer.length} bytes)`);
        
        const pdfOptions = {
            normalizeWhitespace: true,
            disableCombineTextItems: false
        };
        
        const data = await pdf(buffer, pdfOptions);
        
        if (!data.text || data.text.trim().length < 50) {
            throw new Error(`Insufficient text extracted: ${data.text ? data.text.length : 0} characters`);
        }
        
        // Clean up the extracted text
        let cleanedText = data.text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s+/g, ' ')
            .trim();
        
        console.log(`✅ Extracted ${cleanedText.length} characters from ${data.numpages} pages`);
        return cleanedText;
        
    } catch (error) {
        console.error('❌ PDF text extraction failed:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

// Validate extracted resume content
function validateResumeContent(text) {
    if (!text || text.length < 100) {
        return { valid: false, reason: 'Content too short' };
    }
    
    // Check for resume-like content
    const resumeKeywords = [
        'experience', 'education', 'skills', 'work', 'job', 'position',
        'company', 'university', 'degree', 'project', 'achievement',
        'responsible', 'managed', 'developed', 'led', 'created'
    ];
    
    const textLower = text.toLowerCase();
    const foundKeywords = resumeKeywords.filter(keyword => 
        textLower.includes(keyword)
    ).length;
    
    if (foundKeywords < 3) {
        return { valid: false, reason: 'Does not appear to be a resume' };
    }
    
    return { valid: true };
}

// Store resume content in KV
async function storeResumeContent(userId, content) {
    if (!kv || !userId || !content) {
        return false;
    }
    
    try {
        await kv.set(`resume:${userId}`, {
            content: content,
            timestamp: Date.now(),
            length: content.length
        }, { ex: 86400 * 7 }); // 7 days expiration
        
        console.log(`✅ Stored resume for user ${userId} (${content.length} chars)`);
        return true;
    } catch (error) {
        console.error('❌ Failed to store resume:', error);
        return false;
    }
}

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

    console.log('📤 Processing file upload...');

    try {
        const form = formidable({
            maxFileSize: 10 * 1024 * 1024, // 10MB limit
            keepExtensions: true,
            filter: ({ mimetype }) => {
                // Only allow PDF files
                return mimetype && mimetype.includes('pdf');
            },
        });

        const [fields, files] = await form.parse(req);
        
        const uploadedFile = files.resume?.[0];
        const userId = fields.userId?.[0];
        
        if (!uploadedFile) {
            return res.status(400).json({ 
                success: false,
                error: 'No file uploaded or file type not supported. Please upload a PDF file.' 
            });
        }

        console.log(`📄 Processing file: ${uploadedFile.originalFilename} (${uploadedFile.size} bytes)`);

        // Validate file type
        if (!uploadedFile.mimetype?.includes('pdf')) {
            return res.status(400).json({ 
                success: false,
                error: 'Only PDF files are allowed. Please upload a PDF resume.' 
            });
        }

        // Validate file size
        if (uploadedFile.size > 10 * 1024 * 1024) {
            return res.status(413).json({
                success: false,
                error: 'File too large. Please upload a PDF file smaller than 10MB.'
            });
        }

        if (uploadedFile.size < 1000) {
            return res.status(400).json({
                success: false,
                error: 'File appears to be too small or corrupted. Please upload a valid PDF resume.'
            });
        }

        // Read file content
        const fileBuffer = fs.readFileSync(uploadedFile.filepath);
        
        // Extract text from PDF
        let extractedText = null;
        let extractionError = null;
        
        try {
            extractedText = await extractTextFromPDF(fileBuffer);
            
            // Validate that it looks like a resume
            const validation = validateResumeContent(extractedText);
            if (!validation.valid) {
                console.warn(`⚠️ Resume validation failed: ${validation.reason}`);
                // Don't fail the upload, but note the issue
            }
            
        } catch (error) {
            extractionError = error.message;
            console.error('❌ Text extraction failed:', error);
        }

        // Store extracted content if successful and userId provided
        let stored = false;
        if (extractedText && userId) {
            stored = await storeResumeContent(userId, extractedText);
        }

        // File info for response
        const fileInfo = {
            filename: uploadedFile.originalFilename,
            size: uploadedFile.size,
            type: uploadedFile.mimetype,
            uploadTime: new Date().toISOString(),
            textLength: extractedText ? extractedText.length : 0,
            extractionSuccess: !!extractedText,
            stored: stored
        };

        // Clean up temp file
        try {
            await fs.promises.unlink(uploadedFile.filepath);
            console.log('🗑️ Cleaned up temp file');
        } catch (cleanupError) {
            console.warn('⚠️ Failed to clean up temp file:', cleanupError);
        }

        // Prepare response
        let response = {
            success: true,
            message: 'Resume uploaded successfully!',
            file: fileInfo
        };

        if (extractedText) {
            response.message = 'Resume uploaded and processed successfully!';
            response.textExtracted = true;
            response.preview = extractedText.substring(0, 200) + '...';
        } else {
            response.message = 'Resume uploaded but text extraction failed. You can still proceed.';
            response.textExtracted = false;
            response.extractionError = extractionError;
        }

        console.log(`✅ Upload completed: ${fileInfo.filename}`);
        return res.status(200).json(response);

    } catch (error) {
        console.error('❌ Upload handler error:', error);
        
        // Handle specific error types
        if (error.code === 'LIMIT_FILE_SIZE' || error.message.includes('maxFileSize')) {
            return res.status(413).json({ 
                success: false,
                error: 'File too large. Please upload a PDF file smaller than 10MB.' 
            });
        }
        
        if (error.code === 'LIMIT_FILE_TYPE' || error.message.includes('filter')) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid file type. Please upload a PDF file only.' 
            });
        }

        if (error.message.includes('no such file')) {
            return res.status(400).json({
                success: false,
                error: 'No file received. Please select a PDF file to upload.'
            });
        }

        return res.status(500).json({ 
            success: false,
            error: 'Upload failed. Please try again with a valid PDF file.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}