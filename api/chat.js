import { createClient } from "@vercel/kv";
import { getNotionPageContent } from './guide_content.js';

// Initialize the Vercel KV client
const kv = createClient({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

// Enhanced semantic search with better scoring
function findRelevantSections(content, query, maxSections = 4) {
    if (!content || content.trim().length === 0) {
        console.warn('No content provided for search');
        return '';
    }

    // Split into meaningful paragraphs
    const paragraphs = content.split('\n\n')
        .filter(p => p.trim().length > 30)
        .map(p => p.trim());
    
    if (paragraphs.length === 0) {
        console.warn('No paragraphs found in content');
        return content.substring(0, 2000);
    }

    // Enhanced query processing
    const queryLower = query.toLowerCase();
    const queryWords = queryLower
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word));
    
    // Enhanced scoring with semantic understanding
    const scoredParagraphs = paragraphs.map(paragraph => {
        const paraLower = paragraph.toLowerCase();
        let score = 0;
        
        // 1. Exact phrase matching (highest priority)
        if (paraLower.includes(queryLower)) {
            score += 25;
        }
        
        // 2. Word matching with enhanced weights
        queryWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = (paraLower.match(regex) || []).length;
            // Weight by word importance and length
            const wordWeight = word.length > 6 ? 4 : word.length > 4 ? 3 : 2;
            score += matches * wordWeight;
        });
        
        // 3. Tech Nation specific terminology (high priority)
        const techTerms = [
            'tech nation', 'digital technology', 'exceptional talent', 'exceptional promise', 
            'endorsement', 'criteria', 'evidence', 'recommendation letter', 'application process',
            'global talent visa', 'home office', 'mandatory criteria', 'optional criteria'
        ];
        techTerms.forEach(term => {
            if (paraLower.includes(term)) {
                score += 8;
            }
        });
        
        // 4. Context-specific terms based on query intent
        const contextTerms = getContextTerms(queryLower);
        contextTerms.forEach(term => {
            if (paraLower.includes(term)) {
                score += 6;
            }
        });
        
        // 5. Paragraph quality bonus (longer, structured content)
        if (paragraph.length > 200) score += 2;
        if (paragraph.includes('•') || paragraph.includes('-')) score += 1; // Structured content
        if (paragraph.match(/\d+/g)) score += 1; // Contains numbers/metrics
        
        return { paragraph, score };
    });
    
    // Return top scoring sections with minimum threshold
    const relevantSections = scoredParagraphs
        .filter(item => item.score > 1)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSections)
        .map(item => item.paragraph);
    
    if (relevantSections.length === 0) {
        console.warn('No relevant sections found, using first paragraphs');
        return paragraphs.slice(0, 3).join('\n\n');
    }
    
    return relevantSections.join('\n\n---\n\n');
}

// Get context-specific terms based on query intent
function getContextTerms(query) {
    if (query.includes('evidence') || query.includes('document') || query.includes('proof')) {
        return ['portfolio', 'cv', 'letter', 'publication', 'patent', 'award', 'media coverage', 'conference', 'recognition'];
    }
    if (query.includes('process') || query.includes('step') || query.includes('how')) {
        return ['stage', 'submit', 'application', 'review', 'decision', 'timeline', 'fee', 'biometric'];
    }
    if (query.includes('eligibility') || query.includes('requirement') || query.includes('qualify')) {
        return ['experience', 'years', 'sector', 'talent', 'promise', 'meet', 'demonstrate'];
    }
    if (query.includes('timeline') || query.includes('time') || query.includes('long')) {
        return ['weeks', 'months', 'processing', 'wait', 'decision', 'priority', 'rush'];
    }
    return [];
}

// Enhanced AI call with better model and parameters
async function callAIModel(prompt, context, userProfile = null) {
    try {
        // Enhanced system prompt with specific instructions
        const systemPrompt = `You are an expert UK Global Talent Visa consultant specializing in the Digital Technology route through Tech Nation.

CRITICAL INSTRUCTIONS:
- Answer ONLY based on the provided Tech Nation guidance context
- Provide comprehensive, well-structured responses (aim for 400-600 words)
- Use bullet points, numbered lists, and clear sections for readability  
- Include specific details, requirements, and examples from the context
- If the user has uploaded a resume and asks about their profile, reference their background
- Always end with 2-3 relevant follow-up questions to guide them further
- Be encouraging but realistic about their chances
- Focus exclusively on Digital Technology route, not other Global Talent categories

RESPONSE STRUCTURE:
1. Direct answer to their question
2. Relevant details and requirements
3. Practical tips or examples
4. Follow-up questions

If information isn't in the context, say "This specific detail isn't covered in the Tech Nation guidance I have access to, but based on the general process..."`;

        // Choose better model based on availability
        const models = [
            'anthropic/claude-3-haiku',
            'openai/gpt-4o-mini',
            'meta-llama/llama-3.1-8b-instruct:free',
            'deepseek/deepseek-r1-distill-llama-70b:free'
        ];

        let response;
        let modelUsed;

        // Try models in order of preference
        for (const model of models) {
            try {
                modelUsed = model;
                response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
                        'X-Title': 'UK Global Talent Visa Bot'
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: 'system',
                                content: systemPrompt
                            },
                            {
                                role: 'user',
                                content: `TECH NATION GUIDANCE CONTEXT:
${context}

${userProfile ? `USER PROFILE:
Experience: ${userProfile.experience || 'Not specified'}
Role: ${userProfile.role || 'Not specified'}
Contributions: ${userProfile.contributions ? userProfile.contributions.join(', ') : 'Not specified'}
Resume: ${userProfile.resume ? 'Uploaded - ' + userProfile.resume : 'Not uploaded'}

` : ''}USER QUESTION: ${prompt}

Please provide a comprehensive answer based on the context above.`
                            }
                        ],
                        max_tokens: 800, // Increased from 300
                        temperature: 0.4,
                        top_p: 0.9
                    })
                });

                if (response.ok) {
                    console.log(`Successfully used model: ${model}`);
                    break;
                } else if (response.status === 429) {
                    console.log(`Rate limited on ${model}, trying next...`);
                    continue;
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (modelError) {
                console.log(`Model ${model} failed:`, modelError.message);
                if (model === models[models.length - 1]) {
                    throw modelError;
                }
                continue;
            }
        }
        
        if (!response || !response.ok) {
            throw new Error('All models failed');
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Invalid response structure:', data);
            throw new Error('Invalid response structure');
        }
        
        const content = data.choices[0].message.content;
        console.log(`Response generated using ${modelUsed}, length: ${content.length}`);
        return content;
        
    } catch (error) {
        console.error('AI Model call failed:', error);
        throw error;
    }
}

// Get user-uploaded resume content from KV store
async function getResumeContent(userId) {
    try {
        if (!userId || !process.env.UPSTASH_REDIS_URL) {
            return null;
        }
        
        const resumeData = await kv.get(`resume:${userId}`);
        if (resumeData && resumeData.content) {
            console.log(`Retrieved resume for user ${userId}, length: ${resumeData.content.length}`);
            return resumeData.content;
        }
        return null;
    } catch (error) {
        console.warn('Failed to retrieve resume:', error);
        return null;
    }
}

// Main handler
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
        const body = req.body;
        let message, userId, userProfile;

        // Handle different request formats
        if (body.message) {
            message = body.message;
            userId = body.userId;
            userProfile = body.userProfile;
        } else if (body.messages) {
            const messages = body.messages;
            message = messages[messages.length - 1]?.content;
            userId = body.userId;
            userProfile = body.userProfile;
        } else {
            return res.status(400).json({ error: 'No message found in request' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Empty message' });
        }

        // Handle test connection
        if (message === 'test connection') {
            return res.status(200).json({ response: 'API connection successful! 🚀' });
        }

        console.log('Processing message:', message.substring(0, 100));

        // Get guide content (Tech Nation guidance)
        let guideContent;
        try {
            guideContent = await getNotionPageContent();
            if (!guideContent || guideContent.trim().length === 0) {
                console.error('Guide content is empty');
                guideContent = getFallbackGuideContent();
            }
            console.log('Guide content loaded, length:', guideContent.length);
        } catch (error) {
            console.error('Error loading guide content:', error);
            guideContent = getFallbackGuideContent();
        }

        // Get user's resume content if they've uploaded one
        let resumeContent = null;
        if (userId && message.toLowerCase().includes('resume') || message.toLowerCase().includes('my background') || message.toLowerCase().includes('my profile')) {
            resumeContent = await getResumeContent(userId);
        }

        // Combine guide and resume content for context
        let combinedContext = guideContent;
        if (resumeContent) {
            combinedContext += `\n\n--- USER'S RESUME CONTENT ---\n${resumeContent}`;
        }

        // Find relevant sections
        const relevantContext = findRelevantSections(combinedContext, message, 4);
        console.log('Found relevant context, length:', relevantContext.length);

        if (!relevantContext || relevantContext.trim().length === 0) {
            return res.status(200).json({ 
                response: getFallbackResponse(message) || 'I could not find specific information about that in the Tech Nation guidance. Could you please rephrase your question or ask about eligibility criteria, application process, evidence requirements, or timeline?'
            });
        }

        // Check API key
        if (!process.env.OPENROUTER_API_KEY) {
            console.error('OPENROUTER_API_KEY not found');
            return res.status(200).json({
                response: 'I am currently experiencing configuration issues. Please ensure the OPENROUTER_API_KEY environment variable is set.'
            });
        }

        // Get AI response
        let response;
        try {
            response = await callAIModel(message, relevantContext, userProfile);
        } catch (apiError) {
            console.error('AI model failed:', apiError);
            const fallback = getFallbackResponse(message);
            if (fallback) {
                return res.status(200).json({ response: fallback });
            }
            return res.status(200).json({
                response: 'I apologize, but I am currently having trouble processing your request. Please try rephrasing your question, or visit the official Tech Nation website for the most current information.'
            });
        }

        // Store conversation in KV (non-blocking)
        if (userId && process.env.UPSTASH_REDIS_URL) {
            try {
                await kv.set(`chat:${userId}`, JSON.stringify({ 
                    lastMessage: message, 
                    response: response,
                    timestamp: Date.now() 
                }), { ex: 7200 }); // 2 hour expiry
            } catch (kvError) {
                console.warn('KV storage failed:', kvError.message);
            }
        }
        
        return res.status(200).json({ response });

    } catch (error) {
        console.error('Chat API Error:', error);
        return res.status(200).json({ 
            response: 'I encountered an unexpected error. Please try again, and if the problem persists, please visit the official Tech Nation website for guidance.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Fallback guide content
function getFallbackGuideContent() {
    return `Tech Nation Digital Technology Endorsement Guide

ELIGIBILITY REQUIREMENTS
• Minimum 5 years experience in digital technology sector
• Demonstrate exceptional talent or exceptional promise
• Meet all mandatory criteria plus at least 2 of 4 optional criteria

MANDATORY CRITERIA
• Valid passport or national identity card
• CV highlighting digital technology career and achievements
• Personal statement (up to 1,000 words)
• Three letters of recommendation from established digital technology leaders

OPTIONAL CRITERIA (need at least 2 of 4)
1. Evidence of recognition for work outside immediate occupation
2. Evidence of genuine expertise in digital technology
3. Evidence of academic contributions or demonstrable commercial successes
4. Evidence of innovation in digital technology

APPLICATION PROCESS
Stage 1: Tech Nation Endorsement (£456 fee, 8-12 weeks)
Stage 2: Home Office Visa Application (separate fees and timeline)

EVIDENCE PORTFOLIO
• Maximum 10 pieces of evidence
• Focus on external recognition and quantifiable impact
• Recent evidence preferred (last 5 years)
• Each piece should demonstrate contribution to digital technology sector`;
}

// Enhanced fallback responses
function getFallbackResponse(message) {
    const query = message.toLowerCase();
    
    if (query.includes('evidence') || query.includes('document') || query.includes('portfolio')) {
        return `**Evidence Requirements for Tech Nation Application:**

You need to submit a portfolio of up to **10 pieces of evidence** across the 4 optional criteria (must meet at least 2):

**Criteria 1: Recognition Outside Immediate Occupation**
• Media coverage in major publications
• Speaking at significant industry conferences
• Judging prestigious awards or competitions
• Advisory roles for organizations or government bodies
• Industry awards or honors

**Criteria 2: Genuine Expertise in Digital Technology**
• Technical contributions to major platforms
• Open source contributions with significant adoption
• Patents or technical innovations
• Publications in technical journals or blogs
• Recognition by expert peers

**Criteria 3: Academic/Commercial Success**
• Published research with citations
• Successful product launches with metrics
• Revenue growth or business achievements
• Leadership in scaling technology teams
• Funding raised for technology ventures

**Criteria 4: Innovation in Digital Technology**
• Development of new technologies or methodologies
• Significant improvements to existing tech
• Creation of new applications or use cases
• Technology transformation leadership

**Key Tips:**
• Quality over quantity - choose your strongest evidence
• Include quantifiable metrics where possible
• Show external recognition and impact beyond your employer
• Provide context explaining significance of each achievement

What specific type of evidence are you looking to strengthen?`;
    }
    
    return null;
}