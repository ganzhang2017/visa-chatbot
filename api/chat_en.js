// api/chat-en.js - Optimized version with smaller footprint
import { OpenAI } from 'openai';

let openai = null;

function getClient() {
    if (!openai && process.env.OPENROUTER_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
            defaultHeaders: {
                "HTTP-Referer": "https://localhost:3000",
                "X-Title": "UK Global Talent Visa Assistant - English",
            }
        });
    }
    return openai;
}

export default async function handler(req, res) {
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
        const { message, resumeContent, resumeAnalysis } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        if (message === 'test connection') {
            return res.status(200).json({ 
                response: 'English API connection successful! 🇬🇧' 
            });
        }

        // Check for guided questions - use AI to answer them with context
        const guidedQuestions = [
            'What are the eligibility requirements for the Digital Technology route?',
            'How does the Tech Nation application process work? Please include all costs.',
            'What documents and evidence do I need to prepare?',
            'How long does the entire process take?'
        ];

        // For guided questions OR questions with resume, use AI if available
        const shouldUseAI = guidedQuestions.includes(message) || resumeContent || resumeAnalysis;

        if (!shouldUseAI || !process.env.OPENROUTER_API_KEY) {
            return res.status(200).json({ 
                response: getSimpleFallback(message)
            });
        }

        const client = getClient();
        if (!client) {
            return res.status(200).json({ 
                response: getSimpleFallback(message)
            });
        }

        // Build system prompt
        let systemPrompt = `You are a UK Global Talent Visa expert for Digital Technology via Tech Nation. Provide detailed, structured answers in English.`;
        
        if (resumeContent || resumeAnalysis) {
            systemPrompt += `\n\nUser's background:`;
            
            if (resumeAnalysis) {
                if (resumeAnalysis.currentRole) systemPrompt += `\n- Role: ${resumeAnalysis.currentRole}`;
                if (resumeAnalysis.company) systemPrompt += `\n- Company: ${resumeAnalysis.company}`;
                if (resumeAnalysis.skills?.length) systemPrompt += `\n- Skills: ${resumeAnalysis.skills.join(', ')}`;
                if (resumeAnalysis.estimatedYears > 0) systemPrompt += `\n- Experience: ${resumeAnalysis.estimatedYears} years`;
            }
            
            if (resumeContent) systemPrompt += `\n\nResume: ${resumeContent.substring(0, 800)}`;
            
            systemPrompt += `\n\nProvide personalized advice: mention their role/company, recommend suitable route (Talent vs Promise), suggest 2 strongest criteria, list 3 key actions.`;
        }

        // Try models with timeout
        const models = ["x-ai/grok-4-fast:free", "google/gemini-2.0-flash-exp:free", "deepseek/deepseek-chat-v3.1:free"];
        let completion;

        for (const model of models) {
            try {
                completion = await Promise.race([
                    client.chat.completions.create({
                        model: model,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: message }
                        ],
                        max_tokens: 1200,
                        temperature: 0.7,
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
                ]);
                console.log(`Used model: ${model}`);
                break;
            } catch (err) {
                console.log(`Model ${model} failed: ${err.message}`);
                if (model === models[models.length - 1]) throw err;
            }
        }

        const response = completion?.choices[0]?.message?.content;
        
        return res.status(200).json({ 
            response: response || getSimpleFallback(message)
        });

    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(200).json({ 
            response: getSimpleFallback(req.body?.message || '')
        });
    }
}

function getSimpleFallback(message) {
    const q = message.toLowerCase();
    
    if (q.includes('eligibility') || q.includes('requirements')) {
        return `**UK Global Talent Visa - Digital Technology Route**

**Two Routes Available:**
• **Exceptional Talent** - For recognized leaders (5+ years experience)
• **Exceptional Promise** - For emerging leaders (typically <5 years)

**Who Qualifies:**
• Technical roles in tech companies ✅
• Business roles in tech companies ✅  
• Must work IN digital tech, not just use it

**Assessment:** Must meet 2 of 4 criteria with strong evidence

Want details on: Process & costs, required documents, or timeline?`;
    }
    
    if (q.includes('process') || q.includes('cost') || q.includes('fee')) {
        return `**Application Process & Costs**

**Two Stages:**
1. Tech Nation endorsement: £561, 8-12 weeks
2. Home Office visa: £205, 3-8 weeks

**Total Costs:**
• Main applicant: £766 + £5,175 healthcare = £5,941
• Each dependent: £5,380
• Fast-track: +£500-£1,500

**Timeline:** 6-10 months total

Need help with: Documents, eligibility check, or timeline planning?`;
    }
    
    if (q.includes('document') || q.includes('evidence')) {
        return `**Required Documents**

**Mandatory:**
• CV (3 pages max)
• Personal statement (1,000 words max)
• 3 recommendation letters from tech leaders

**Evidence (10 items max, meet 2+ criteria):**
1. Industry recognition (media, awards, speaking)
2. Technical competence (open source, patents, papers)
3. Academic/business success (publications, revenue)
4. Innovation leadership (new tech, breakthroughs)

**Quality Matters:** External recognition > internal, recent > old, data > descriptions

Want specific: Eligibility review, process info, or timeline?`;
    }
    
    if (q.includes('timeline') || q.includes('how long')) {
        return `**Complete Timeline**

**Preparation: 3-6 months**
• Collect evidence: 2-4 months
• Get recommendation letters: 1-2 months
• Write documents: 2-4 weeks

**Processing:**
• Tech Nation: 8-12 weeks (or 3-5 weeks fast-track)
• Home Office: 3-8 weeks (or 1 week priority)

**Total Time:**
• Fastest: 4-5 months
• Standard: 7-9 months
• Conservative: 10-12 months

**Tip:** Start 12 months before target UK entry date

Need: Eligibility info, cost breakdown, or document guidance?`;
    }
    
    return `**UK Global Talent Visa Overview**

**Key Points:**
• No employer sponsorship needed
• 5-year visa, renewable
• Settlement after 3-5 years
• Total cost: ~£6,000 + dependents

**Process:**
1. Tech Nation endorsement (£561, 8-12 weeks)
2. Home Office visa (£205, 3-8 weeks)

**Success Factors:**
• Strong external recognition
• Quantifiable achievements
• Quality recommendation letters

**Ask me about:**
• Eligibility requirements
• Application process & costs
• Required documents
• Timeline planning

What would you like to know?`;
}