// api/chat-en.js - FULL DEBUG VERSION
import { OpenAI } from 'openai';

// Test API key format first
function validateAPIKey(apiKey) {
    if (!apiKey) {
        return { valid: false, reason: 'API key is missing' };
    }
    
    if (typeof apiKey !== 'string') {
        return { valid: false, reason: 'API key is not a string' };
    }
    
    // OpenRouter keys should start with sk-or-v1-
    if (!apiKey.startsWith('sk-or-v1-')) {
        return { valid: false, reason: `API key should start with 'sk-or-v1-' but starts with '${apiKey.substring(0, 10)}'` };
    }
    
    if (apiKey.length < 20) {
        return { valid: false, reason: 'API key appears too short' };
    }
    
    return { valid: true, reason: 'API key format looks correct' };
}

export default async function handler(req, res) {
    // CORS headers
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
        // Step 1: Basic request validation
        console.log('🚀 STARTING DEBUG SESSION');
        console.log('📨 Request method:', req.method);
        console.log('📨 Request headers:', JSON.stringify(req.headers, null, 2));
        
        const { message } = req.body;
        
        if (!message) {
            console.log('❌ No message provided');
            return res.status(400).json({ error: 'No message provided' });
        }

        console.log('📝 Message received:', message.substring(0, 100));

        // Step 2: Environment variable validation
        console.log('\n🔍 ENVIRONMENT VALIDATION:');
        console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY);
        console.log('YOUR_SITE_URL:', process.env.YOUR_SITE_URL || 'undefined');
        
        const apiKeyValidation = validateAPIKey(process.env.OPENROUTER_API_KEY);
        console.log('API Key validation:', apiKeyValidation);
        
        if (!apiKeyValidation.valid) {
            console.log('❌ API Key validation failed');
            return res.status(500).json({ 
                error: `API Key Error: ${apiKeyValidation.reason}`,
                hint: 'Check your OPENROUTER_API_KEY environment variable in Vercel settings'
            });
        }

        // Step 3: Test connection first
        if (message === 'test connection') {
            console.log('✅ Test connection request');
            return res.status(200).json({ 
                response: 'Connection successful! Environment validated.',
                debug: {
                    apiKeyValid: apiKeyValidation.valid,
                    siteUrl: process.env.YOUR_SITE_URL || 'not-set'
                }
            });
        }

        // Step 4: Initialize OpenAI client with verbose logging
        console.log('\n🤖 INITIALIZING OPENAI CLIENT:');
        
        const clientConfig = {
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": process.env.YOUR_SITE_URL || "https://your-app.vercel.app",
                "X-Title": "UK Global Talent Visa Assistant",
            }
        };
        
        console.log('Client config (sanitized):', {
            baseURL: clientConfig.baseURL,
            defaultHeaders: clientConfig.defaultHeaders,
            apiKeyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 12)
        });
        
        const openai = new OpenAI(clientConfig);

        // Step 5: Prepare request
        const messages = [
            {
                role: "system",
                content: `You are a UK Global Talent Visa expert for the Digital Technology route. 

RESPONSE FORMAT REQUIREMENTS:
- Use clear bullet points with • symbols
- Format information in readable sections
- Use **bold** for important headings
- Break down complex information into digestible steps
- Avoid <br> tags - use proper line breaks
- Use numbered lists for sequential steps
- Keep paragraphs short and focused

GUIDANCE PRINCIPLES:
1. Provide specific actionable steps
2. Focus on what they need to DO, not success likelihood  
3. Be encouraging but practical
4. Reference official criteria
5. Give concrete next steps

You are helping with UK Global Talent Visa applications through Tech Nation's Digital Technology route.`
            },
            {
                role: "user",
                content: message
            }
        ];

        console.log('\n📤 MAKING API REQUEST:');
        console.log('Model: openai/gpt-oss-120b');
        console.log('Messages count:', messages.length);
        console.log('System prompt length:', messages[0].content.length);
        console.log('User message length:', messages[1].content.length);

        // Step 6: Make the API call with detailed error catching
        let response;
        try {
            console.log('⏳ Sending request to OpenRouter...');
            
            const completion = await openai.chat.completions.create({
                model: "openai/gpt-oss-120b",
                messages: messages,
                max_tokens: 1500, // Increased for longer responses
                temperature: 0.7,
            });

            console.log('✅ Raw response received');
            console.log('Response object keys:', Object.keys(completion || {}));
            console.log('Choices count:', completion?.choices?.length || 0);
            
            response = completion.choices[0]?.message?.content;
            
            if (!response) {
                throw new Error('No content in response');
            }
            
            console.log('✅ SUCCESS! Response length:', response.length);
            console.log('Response preview:', response.substring(0, 100));

        } catch (apiError) {
            console.log('\n❌ API ERROR DETAILS:');
            console.log('Error name:', apiError.name);
            console.log('Error message:', apiError.message);
            console.log('Error status:', apiError.status);
            console.log('Error code:', apiError.code);
            console.log('Error cause:', apiError.cause);
            console.log('Full error object:', JSON.stringify(apiError, null, 2));
            
            // Try to get more details from the error response
            if (apiError.response) {
                console.log('Error response status:', apiError.response.status);
                console.log('Error response headers:', apiError.response.headers);
                console.log('Error response data:', apiError.response.data);
            }

            // Return detailed error information
            return res.status(500).json({
                error: 'OpenRouter API failed',
                details: {
                    name: apiError.name,
                    message: apiError.message,
                    status: apiError.status,
                    code: apiError.code,
                    responseData: apiError.response?.data
                },
                troubleshooting: {
                    apiKeyFormat: apiKeyValidation,
                    model: 'openai/gpt-oss-120b',
                    endpoint: 'https://openrouter.ai/api/v1/chat/completions'
                }
            });
        }

        // Step 7: Return successful response
        return res.status(200).json({ 
            response,
            debug: {
                responseLength: response.length,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.log('\n💥 HANDLER ERROR:');
        console.log('Handler error:', error);
        
        return res.status(500).json({ 
            error: 'Handler failed',
            message: error.message,
            stack: error.stack
        });
    }
}