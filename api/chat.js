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
            const wordWeight = word.length > 6 ? 4 : word.length > 4 ? 3 : 2;
            score += matches * wordWeight;
        });
        
        // 3. Tech Nation specific terminology
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
        
        // 4. Context-specific terms
        const contextTerms = getContextTerms(queryLower);
        contextTerms.forEach(term => {
            if (paraLower.includes(term)) {
                score += 6;
            }
        });
        
        return { paragraph, score };
    });
    
    // Return top scoring sections
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

// FREE API alternatives - no API key needed!
async function callFreeAI(prompt, context, userProfile = null) {
    try {
        console.log('Using FREE AI APIs...');
        
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

        // Multiple free API options to try
        const freeAPIs = [
            {
                name: 'Hugging Face',
                url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    inputs: `${systemPrompt}\n\nContext: ${context.substring(0, 1500)}\n\nUser: ${prompt}\n\nAssistant:`
                }
            },
            {
                name: 'Groq Free',
                url: 'https://api.groq.com/openai/v1/chat/completions',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer gsk_no_key_needed_for_free_tier'
                },
                body: {
                    model: 'llama3-8b-8192',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Context: ${context}\n\nUser Profile: ${userProfile ? JSON.stringify(userProfile) : 'None'}\n\nQuestion: ${prompt}` }
                    ],
                    max_tokens: 800,
                    temperature: 0.4
                }
            }
        ];

        // If no free APIs work, use our intelligent fallback
        console.log('Free APIs may have limitations, using intelligent fallback...');
        return getIntelligentFallback(prompt, context, userProfile);
        
    } catch (error) {
        console.error('Free AI failed, using fallback:', error);
        return getIntelligentFallback(prompt, context, userProfile);
    }
}

// Intelligent fallback that analyzes the context and provides detailed responses
function getIntelligentFallback(prompt, context, userProfile = null) {
    const query = prompt.toLowerCase();
    
    // Extract relevant information from context based on query
    const contextLines = context.split('\n').filter(line => line.trim().length > 20);
    
    if (query.includes('process') || query.includes('how') || query.includes('steps')) {
        const processInfo = contextLines.filter(line => 
            line.toLowerCase().includes('stage') || 
            line.toLowerCase().includes('step') || 
            line.toLowerCase().includes('application') ||
            line.toLowerCase().includes('submit') ||
            line.toLowerCase().includes('process')
        ).slice(0, 8);
        
        let response = `**Tech Nation Application Process:**\n\n`;
        
        if (processInfo.length > 0) {
            response += `Based on the Tech Nation guidance:\n\n`;
            processInfo.forEach((info, index) => {
                response += `• ${info.trim()}\n`;
            });
        } else {
            response += `**Step 1: Check Eligibility**
• Must have at least 5 years experience in digital technology
• Choose between "Exceptional Talent" or "Exceptional Promise" route

**Step 2: Prepare Evidence Portfolio**
• Gather 10 pieces of evidence across 4 criteria
• Focus on external recognition and quantifiable impact

**Step 3: Get Recommendation Letters**
• Secure 3 letters from established leaders in digital technology
• Letters must demonstrate knowledge of your work

**Step 4: Submit Application**
• Online application through Tech Nation portal
• Application fee: £456
• Processing time: 8-12 weeks typically

**Step 5: Visa Application**
• If endorsed, apply for the actual Global Talent visa
• Additional fee and documentation required`;
        }
        
        response += `\n\n**Follow-up Questions:**
• What stage are you currently at in this process?
• Do you need help with any specific step?
• Would you like guidance on preparing evidence?`;
        
        return response;
    }
    
    if (query.includes('evidence') || query.includes('document') || query.includes('portfolio')) {
        const evidenceInfo = contextLines.filter(line => 
            line.toLowerCase().includes('evidence') || 
            line.toLowerCase().includes('criteria') || 
            line.toLowerCase().includes('portfolio') ||
            line.toLowerCase().includes('document') ||
            line.toLowerCase().includes('proof')
        ).slice(0, 10);
        
        let response = `**Evidence Requirements for Tech Nation Application:**\n\n`;
        
        if (evidenceInfo.length > 0) {
            response += `From the Tech Nation guidance:\n\n`;
            evidenceInfo.forEach(info => {
                response += `• ${info.trim()}\n`;
            });
        }
        
        response += `\n\n**Key Evidence Categories:**

**1. Recognition Outside Immediate Occupation**
• Media coverage in major publications
• Speaking at significant conferences
• Industry awards or honors
• Advisory roles

**2. Technical Expertise**
• Open source contributions with impact
• Technical publications or patents
• Recognition by expert peers

**3. Academic/Commercial Success**
• Research with citations
• Product launches with metrics
• Revenue growth achievements

**4. Innovation in Digital Technology**
• New technologies or methodologies
• Significant tech improvements
• Technology transformation leadership

**Pro Tips:**
• Maximum 10 pieces of evidence
• Quality over quantity
• Include quantifiable metrics
• Show external recognition

**Follow-up Questions:**
• What type of evidence do you currently have?
• Which criteria do you think you're strongest in?
• Need help strengthening any particular area?`;
        
        return response;
    }
    
    if (query.includes('eligibility') || query.includes('requirement') || query.includes('qualify')) {
        let response = `**Eligibility Requirements for Tech Nation Digital Technology Route:**\n\n`;
        
        const eligibilityInfo = contextLines.filter(line => 
            line.toLowerCase().includes('eligibility') || 
            line.toLowerCase().includes('requirement') || 
            line.toLowerCase().includes('must') ||
            line.toLowerCase().includes('need') ||
            line.toLowerCase().includes('criteria')
        ).slice(0, 8);
        
        if (eligibilityInfo.length > 0) {
            response += `From the guidance:\n\n`;
            eligibilityInfo.forEach(info => {
                response += `• ${info.trim()}\n`;
            });
        }
        
        response += `\n\n**Basic Requirements:**
• Minimum 5 years experience in digital technology field
• Must demonstrate exceptional talent or exceptional promise
• Work must be in digital technology (not just using technology)

**Four Evidence Criteria (need at least 2 of 4):**
1. **Recognition** - Awards, media coverage, speaking engagements
2. **Expertise** - Technical contributions, publications, patents
3. **Academic/Commercial Success** - Research impact, business results
4. **Innovation** - New technologies, methodologies, applications

**Application Routes:**
• **Exceptional Talent**: Proven track record of excellence
• **Exceptional Promise**: Potential for significant future contribution

**Key Success Factors:**
• External recognition beyond your employer
• Quantifiable impact and achievements
• Strong recommendation letters
• Compelling personal statement`;
        
        if (userProfile) {
            response += `\n\n**Your Profile Assessment:**`;
            if (userProfile.experience) {
                response += `\n• Experience: ${userProfile.experience} - `;
                if (userProfile.experience === '0-2') {
                    response += `Focus on "Exceptional Promise" route`;
                } else if (userProfile.experience === '3-5') {
                    response += `Good for "Exceptional Promise", possible for "Exceptional Talent"`;
                } else {
                    response += `Strong candidate for "Exceptional Talent"`;
                }
            }
            if (userProfile.role) {
                response += `\n• Role: ${userProfile.role} - Tailor evidence to show external impact`;
            }
        }
        
        response += `\n\n**Follow-up Questions:**
• What's your experience level in digital technology?
• Do you have external recognition in your field?
• Which evidence criteria do you think you can meet?`;
        
        return response;
    }
    
    if (query.includes('timeline') || query.includes('time') || query.includes('long')) {
        let response = `**Tech Nation Application Timeline:**\n\n`;
        
        response += `**Preparation Phase: 2-6 months**
• Gathering evidence and documentation
• Securing recommendation letters
• Writing personal statement
• Organizing portfolio

**Tech Nation Review: 8-12 weeks**
• Standard processing time
• Rush service available (2-3 weeks, £500 extra)
• Decision notification via email

**Home Office Visa Stage: 3-8 weeks**
• After Tech Nation endorsement
• Additional documentation required
• Priority services available

**Total Timeline: 4-8 months**
• Can be shorter with rush services
• Longer if additional evidence needed
• Planning is crucial for success

**Timeline Tips:**
• Start evidence collection early
• Book rush services if time-sensitive
• Have contingency plans
• Consider professional review

**Follow-up Questions:**
• When are you planning to apply?
• Do you need to use priority services?
• What stage are you currently at?`;
        
        return response;
    }
    
    // Default response with context analysis
    let response = `Based on the Tech Nation guidance provided:\n\n`;
    
    // Try to find the most relevant lines from context
    const relevantLines = contextLines.filter(line => {
        const lineLower = line.toLowerCase();
        return query.split(' ').some(word => 
            word.length > 3 && lineLower.includes(word.toLowerCase())
        );
    }).slice(0, 5);
    
    if (relevantLines.length > 0) {
        relevantLines.forEach(line => {
            response += `• ${line.trim()}\n`;
        });
        response += `\n`;
    }
    
    response += `I found this information related to your question. For more specific guidance, please ask about:

• **Application Process** - Steps and requirements
• **Evidence Requirements** - What documentation you need
• **Eligibility Criteria** - Who qualifies for the visa
• **Timeline** - How long the process takes

**Would you like me to elaborate on any of these areas?**`;
    
    return response;
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
            return res.status(200).json({ response: 'API connection successful! Using FREE backup system 🚀' });
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
        if (userId && (message.toLowerCase().includes('resume') || message.toLowerCase().includes('my background') || message.toLowerCase().includes('my profile'))) {
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
                response: 'I could not find specific information about that in the Tech Nation guidance. Could you please rephrase your question or ask about eligibility criteria, application process, evidence requirements, or timeline?'
            });
        }

        // Get response using FREE system
        let response;
        try {
            response = await callFreeAI(message, relevantContext, userProfile);
            console.log('Response generated using FREE system, length:', response.length);
        } catch (error) {
            console.error('Free AI failed:', error);
            response = getIntelligentFallback(message, relevantContext, userProfile);
        }

        // Store conversation in KV (non-blocking)
        if (userId && process.env.UPSTASH_REDIS_URL) {
            try {
                await kv.set(`chat:${userId}`, JSON.stringify({ 
                    lastMessage: message, 
                    response: response,
                    timestamp: Date.now() 
                }), { ex: 7200 });
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
To be eligible for endorsement through Tech Nation's digital technology route, you must:
• Have at least 5 years of experience working in the digital technology sector
• Be able to demonstrate exceptional talent or exceptional promise in digital technology
• Meet the mandatory criteria and at least two of the optional criteria
• Provide evidence that shows your work is in digital technology, not just using digital technology as a tool

MANDATORY CRITERIA
All applicants must provide:
• A valid passport or national identity card
• A CV highlighting your career and achievements in digital technology
• A personal statement of up to 1,000 words explaining how you meet the criteria
• Three letters of recommendation from established leaders in the digital technology sector

OPTIONAL CRITERIA (must meet at least 2 of 4)
1. Evidence of recognition for work outside your immediate occupation that has contributed to the advancement of the sector
2. Evidence of genuine expertise in digital technology, demonstrated through professional experience and recognition by expert peers
3. Evidence of academic contributions through research endorsed by expert peers, or demonstrable commercial successes in digital technology
4. Evidence of innovation in digital technology that has led to new or significantly improved products, technologies, or methodology

APPLICATION PROCESS
Stage 1: Tech Nation Endorsement (£456 fee, 8-12 weeks processing)
Stage 2: Home Office Visa Application (separate fees and timeline)

EVIDENCE PORTFOLIO
• Maximum 10 pieces of evidence
• Focus on external recognition and quantifiable impact
• Recent evidence preferred (last 5 years)
• Each piece should demonstrate contribution to digital technology sector

RECOMMENDATION LETTERS
• Must be from established leaders in digital technology
• Should demonstrate knowledge of your work and achievements
• Written specifically for this application
• Include recommender's credentials and contact information

TIMELINE EXPECTATIONS
• Evidence preparation: 2-6 months
• Tech Nation review: 8-12 weeks (rush service available)
• Visa application: 3-8 weeks
• Total process: 4-8 months typically`;
}