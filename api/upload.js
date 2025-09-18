// api/upload.js - Minimal working version
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { content, userId, filename } = req.body;
        
        if (!content || !userId) {
            return res.status(400).json({ 
                error: 'Missing required fields: content and userId' 
            });
        }

        // For now, just acknowledge the upload
        // Later you can add KV storage or other persistence
        console.log(`Resume uploaded for user ${userId}, filename: ${filename}`);

        return res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully!',
            userId: userId
        });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ 
            error: 'Upload failed. Please try again.' 
        });
    }
}