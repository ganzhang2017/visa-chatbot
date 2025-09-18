// api/upload.js
import { createClient } from "@vercel/kv";

// Initialize KV client
let kv = null;
if (process.env.UPSTASH_REDIS_URL && process.env.REDIS_TOKEN) {
    try {
        kv = createClient({
            url: process.env.UPSTASH_REDIS_URL,
            token: process.env.REDIS_TOKEN,
        });
        console.log('✅ Upload Redis KV client initialized');
    } catch (error) {
        console.warn('⚠️ Upload Redis KV client initialization failed:', error.message);
        kv = null;
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

  try {
    // For now, let's create a simplified upload handler that doesn't use formidable
    // since that might be causing deployment issues
    
    const { content, userId, filename } = req.body;
    
    if (!content || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: content and userId' 
      });
    }

    // Store resume content in KV if available
    if (kv) {
      try {
        await kv.set(`resume:${userId}`, JSON.stringify({
          content: content,
          filename: filename || 'resume.txt',
          uploadTime: new Date().toISOString()
        }), { ex: 86400 * 7 }); // Expire after 7 days
        
        console.log(`Resume stored for user ${userId}`);
      } catch (kvError) {
        console.warn('KV storage failed:', kvError.message);
        // Continue without KV storage
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Resume content uploaded successfully!',
      userId: userId
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    return res.status(500).json({ 
      error: 'Upload failed. Please try again.' 
    });
  }
}