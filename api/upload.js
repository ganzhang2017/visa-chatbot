// api/upload.js - Fixed for Vercel Serverless
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-cache');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowedMethods: ['POST']
        });
    }

    try {
        console.log('Upload request received');
        console.log('Request method:', req.method);
        console.log('Content-Type:', req.headers['content-type']);

        // Parse request body safely
        let body;
        if (typeof req.body === 'string') {
            body = JSON.parse(req.body);
        } else {
            body = req.body || {};
        }

        const { content, userId, filename } = body;
        
        // Validate required fields
        if (!content || typeof content !== 'string') {
            console.log('Missing or invalid content field');
            return res.status(400).json({ 
                error: 'Missing or invalid content field',
                success: false
            });
        }

        if (!userId || typeof userId !== 'string') {
            console.log('Missing or invalid userId field');
            return res.status(400).json({ 
                error: 'Missing or invalid userId field',
                success: false
            });
        }

        // Validate content length
        if (content.length > 100000) { // 100KB limit for text content
            console.log('Content too large:', content.length);
            return res.status(413).json({ 
                error: 'Content too large. Please upload a smaller file.',
                success: false
            });
        }

        // Basic content validation
        const cleanContent = content.trim();
        if (cleanContent.length < 50) {
            return res.status(400).json({ 
                error: 'Content too short. Please upload a more detailed CV/resume.',
                success: false
            });
        }

        // Log successful processing (in production, you'd store this in a database)
        console.log(`✅ Resume processed for user ${userId}`);
        console.log(`📄 Filename: ${filename || 'unknown'}`);
        console.log(`📊 Content length: ${cleanContent.length} characters`);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For now, we'll just acknowledge successful upload
        // In production, you would:
        // 1. Store the content in a database (e.g., KV store, PostgreSQL)
        // 2. Process the content to extract key information
        // 3. Associate it with the user session

        const response = {
            success: true,
            message: 'CV/Resume uploaded and processed successfully!',
            userId: userId,
            filename: filename || 'uploaded_document',
            contentLength: cleanContent.length,
            timestamp: new Date().toISOString(),
            // You might include extracted insights:
            insights: {
                hasContact: cleanContent.toLowerCase().includes('email') || cleanContent.toLowerCase().includes('@'),
                hasExperience: cleanContent.toLowerCase().includes('experience') || cleanContent.toLowerCase().includes('worked'),
                hasTechSkills: cleanContent.toLowerCase().includes('software') || 
                              cleanContent.toLowerCase().includes('developer') ||
                              cleanContent.toLowerCase().includes('engineer') ||
                              cleanContent.toLowerCase().includes('data') ||
                              cleanContent.toLowerCase().includes('ai') ||
                              cleanContent.toLowerCase().includes('machine learning'),
                hasEducation: cleanContent.toLowerCase().includes('university') || 
                             cleanContent.toLowerCase().includes('degree') ||
                             cleanContent.toLowerCase().includes('bachelor') ||
                             cleanContent.toLowerCase().includes('master'),
                wordCount: cleanContent.split(/\s+/).length
            }
        };

        console.log('✅ Upload successful:', {
            userId,
            filename,
            contentLength: cleanContent.length
        });

        return res.status(200).json(response);

    } catch (error) {
        console.error('❌ Upload processing error:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        // Handle specific error types
        let errorMessage = 'Upload processing failed. Please try again.';
        let statusCode = 500;

        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            errorMessage = 'Invalid request format. Please try again.';
            statusCode = 400;
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Upload timed out. Please try with a smaller file.';
            statusCode = 408;
        }

        return res.status(statusCode).json({ 
            error: errorMessage,
            success: false,
            timestamp: new Date().toISOString(),
            ...(process.env.NODE_ENV === 'development' && {
                debug: {
                    message: error.message,
                    stack: error.stack
                }
            })
        });
    }
}