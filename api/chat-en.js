<<<<<<< HEAD
// api/chat-en.js - Fixed with pre-defined answers and better resume integration
import { OpenAI } from 'openai';

// Simple OpenRouter client initialization
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
=======
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
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
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
<<<<<<< HEAD
        const { message, resumeContent, resumeAnalysis } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        if (message === 'test connection') {
            return res.status(200).json({ 
                response: 'English API connection successful! 🇬🇧' 
            });
        }

        // Check if this is one of the 4 guided questions - return prepared answers immediately
        const guidedQuestions = [
            'What are the eligibility requirements for the Digital Technology route?',
            'How does the Tech Nation application process work? Please include all costs.',
            'What documents and evidence do I need to prepare?',
            'How long does the entire process take?'
        ];

        if (guidedQuestions.includes(message)) {
            return res.status(200).json({ 
                response: getPreparedAnswer(message)
            });
        }

        // For other questions, try AI if API key available
        if (!process.env.OPENROUTER_API_KEY) {
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

        // ENHANCED RESUME ANALYSIS LOGGING
        console.log('=== ENHANCED RESUME DEBUG ===');
        console.log('Message:', message.substring(0, 200));
        console.log('Has resumeContent:', !!resumeContent);
        console.log('Has resumeAnalysis:', !!resumeAnalysis);
        
        if (resumeContent) {
            console.log('Resume content length:', resumeContent.length);
            console.log('Resume full content:', resumeContent);
        }
        
        if (resumeAnalysis) {
            console.log('Resume analysis received:', JSON.stringify(resumeAnalysis, null, 2));
            console.log('Recent positions:', resumeAnalysis.recentPositions || []);
            console.log('Skills:', resumeAnalysis.skills ? resumeAnalysis.skills.slice(0, 10) : []);
            console.log('Companies:', resumeAnalysis.companies || []);
        }
        console.log('=== END ENHANCED DEBUG ===');

        // Try working models
        let completion;
        const workingModels = [
            "x-ai/grok-4-fast:free",
            "google/gemini-2.0-flash-exp:free", 
            "deepseek/deepseek-chat-v3.1:free"
        ];

        for (const model of workingModels) {
            try {
                let systemPrompt = `You are a UK Global Talent Visa expert specializing in the Digital Technology route through Tech Nation. Respond in English with specific actionable advice.

RESPONSE FORMAT REQUIREMENTS:
- Use clear bullet points with • symbols
- Format information in readable sections  
- Use **bold** for important headings
- Break down complex information into digestible steps
- Keep paragraphs short and focused
- Use numbered lists for sequential steps

GUIDANCE PRINCIPLES:
1. Provide specific actionable steps
2. Focus on what they need to DO, not success likelihood
3. Be encouraging but practical
4. Reference official Tech Nation criteria
5. Give concrete next steps`;
                
                // ENHANCED RESUME INTEGRATION
                if (resumeContent || resumeAnalysis) {
                    systemPrompt += `\n\n=== USER'S SPECIFIC BACKGROUND ===`;
                    
                    if (resumeAnalysis && resumeAnalysis.recentPositions && resumeAnalysis.recentPositions.length > 0) {
                        systemPrompt += `\nCURRENT/RECENT POSITIONS: ${resumeAnalysis.recentPositions.slice(0, 2).join(' and ')}`;
                    }
                    
                    if (resumeAnalysis && resumeAnalysis.skills && resumeAnalysis.skills.length > 0) {
                        systemPrompt += `\nTECHNICAL SKILLS: ${resumeAnalysis.skills.slice(0, 12).join(', ')}`;
                    }
                    
                    if (resumeAnalysis && resumeAnalysis.companies && resumeAnalysis.companies.length > 0) {
                        systemPrompt += `\nCOMPANIES WORKED AT: ${resumeAnalysis.companies.join(', ')}`;
                    }
                    
                    if (resumeContent) {
                        const resumeExcerpt = resumeContent.substring(0, 1500);
                        systemPrompt += `\n\nDETAILED RESUME CONTENT:\n${resumeExcerpt}`;
                    }
                    
                    systemPrompt += `\n\n*** CRITICAL INSTRUCTION ***
You MUST reference their SPECIFIC job titles, companies, and skills in your response. 
For example: "Based on your role as [their actual job title] at [their actual company]..." 
or "Given your experience with [their actual skills]..."
DO NOT give generic advice - make it personal and specific to their background.
*** END CRITICAL INSTRUCTION ***`;
                }

                completion = await Promise.race([
                    client.chat.completions.create({
                        model: model,
                        messages: [
                            {
                                role: "system",
                                content: systemPrompt
                            },
                            {
                                role: "user", 
                                content: message
                            }
                        ],
                        max_tokens: 1500,
                        temperature: 0.7,
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 20000)
                    )
                ]);
                
                console.log(`Successfully used model: ${model}`);
                
                // Log AI response for debugging
                const aiResponse = completion.choices[0]?.message?.content;
                if (aiResponse) {
                    console.log('=== AI RESPONSE DEBUG ===');
                    console.log('Response length:', aiResponse.length);
                    console.log('Full AI response:', aiResponse);
                    console.log('=== END AI RESPONSE DEBUG ===');
                }
                
                break;
            } catch (modelError) {
                console.log(`Model ${model} failed:`, modelError.message);
                if (model === workingModels[workingModels.length - 1]) {
                    throw modelError;
                }
                continue;
            }
        }

        const response = completion?.choices[0]?.message?.content;
        
        if (response) {
            return res.status(200).json({ response });
        } else {
            return res.status(200).json({ 
                response: getSimpleFallback(message)
            });
        }

    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(200).json({ 
            response: getSimpleFallback(req.body?.message || '')
        });
    }
}

// PRE-DEFINED COMPREHENSIVE ANSWERS
function getPreparedAnswer(question) {
    if (question === 'What are the eligibility requirements for the Digital Technology route?') {
        return `**UK Global Talent Visa - Digital Technology Route Eligibility**

**Basic Requirements:**
• Minimum 5 years of relevant experience in digital technology
• Must be working IN digital technology (not just using digital tools)
• No age or educational requirements
• Must demonstrate exceptional talent OR exceptional promise

**Two Application Routes:**

**🌟 Exceptional Talent Route**
• For established leaders who have already gained recognition
• Typically suited for professionals with 10+ years experience
• Must show significant achievements and industry impact
• Requires evidence of being at the forefront of digital technology

**⭐ Exceptional Promise Route**
• For emerging leaders with potential to become industry leaders
• Typically suited for professionals with 5-10 years experience
• Must show evidence of exceptional promise and career trajectory
• Designed for those who haven't yet achieved widespread recognition

**Assessment Structure:**
• **Mandatory Evidence:** All applicants must provide CV, personal statement, and 3 reference letters
• **Optional Evidence:** Must meet at least 2 out of 4 criteria with up to 10 pieces of evidence

**Qualifying Digital Technology Fields:**
• Software development and engineering
• Artificial intelligence and machine learning  
• Data science and analytics
• Cybersecurity and information security
• Digital product management
• Cloud computing and infrastructure
• Blockchain and distributed systems
• DevOps and system architecture
• Technical leadership and CTO roles
• Digital transformation and strategy

**What DOESN'T Qualify:**
• General IT support or helpdesk roles
• Digital marketing without technical component
• Using technology tools without developing them
• Academic roles without industry connection
• Sales roles (even for tech products)

**Next Steps:**
1. Assess which route (Talent vs Promise) fits your profile
2. Review the 4 optional criteria to identify your strongest areas
3. Begin gathering evidence from the past 5 years`;
    }
    
    if (question === 'How does the Tech Nation application process work? Please include all costs.') {
        return `**Complete Tech Nation Application Process & All Costs**

**📋 Two-Stage Process Overview**

**Stage 1: Tech Nation Endorsement**
• Submit application to Tech Nation (independent endorsing body)
• They assess your digital technology credentials
• Must receive endorsement before applying for visa
• This is the main assessment stage

**Stage 2: Home Office Visa Application**  
• Apply to UK Home Office for the actual visa
• Straightforward process once you have endorsement
• Includes biometric appointment and health checks

**💰 Complete Cost Breakdown**

**Main Applicant Costs:**
• Tech Nation endorsement fee: **£561**
• Home Office visa fee: **£205** 
• Immigration Health Surcharge (5 years): **£5,175**
• **Total for main applicant: £5,941**

**Each Dependent (spouse/children under 18):**
• Home Office visa fee: **£205**
• Immigration Health Surcharge (5 years): **£5,175** 
• **Total per dependent: £5,380**

**Optional Fast-Track Services:**
• Tech Nation priority processing: **+£500 to £1,500**
  (Reduces processing from 8-12 weeks to 3-5 weeks)
• Home Office priority processing: **+£500 to £800**
  (Reduces processing from 3-8 weeks to 1 week)

**📅 Processing Timeline**

**Tech Nation Stage:**
• Standard processing: 8-12 weeks
• Priority processing: 3-5 weeks  
• Success rate: Approximately 50-60% for well-prepared applications

**Home Office Stage:**
• Outside UK: 3 weeks
• Inside UK: 8 weeks
• Priority: 1 week (additional cost)

**🎯 Application Requirements - Tech Nation Stage**

**Mandatory Documents:**
1. Current passport
2. CV (maximum 3 pages)
3. Personal statement (maximum 1,000 words) 
4. Three letters of recommendation

**Evidence Portfolio:**
• Maximum 10 pieces of evidence
• Must satisfy at least 2 of the 4 optional criteria
• Evidence must be from the last 5 years
• Quality over quantity - focus on your strongest evidence

**💡 Money-Saving Tips:**
• Use standard processing unless urgently needed
• Prepare thoroughly to avoid reapplication (can't reapply for 6 months if rejected)
• Consider whether dependents can join later if costs are prohibitive initially

**⚠️ Important Notes:**
• All fees are non-refundable
• Visa starts from approval date, not arrival in UK
• Can work immediately upon arrival with endorsed visa`;
    }
    
    if (question === 'What documents and evidence do I need to prepare?') {
        return `**Complete Tech Nation Evidence Checklist**

**📄 Mandatory Documents (Required for All Applications)**

**1. Current Passport or National Identity Document**
• Must be valid for entire application period
• Include all relevant pages (photo, details, previous UK visas)

**2. Curriculum Vitae (Maximum 3 Pages)**
• Focus on digital technology career progression
• Include quantifiable achievements and impacts
• Highlight leadership roles and technical expertise
• Use reverse chronological order (most recent first)

**3. Personal Statement (Maximum 1,000 Words)**  
• Explain how you meet the eligibility criteria
• Demonstrate your work is in digital technology core (not support)
• Outline specific contributions to the field
• Describe UK plans and how you'll contribute to UK tech sector

**4. Three Letters of Recommendation**
• From senior figures in digital technology who know your work
• Cannot be from family, friends, or business partners
• Must be written specifically for this application (no generic letters)
• Should reference specific achievements and potential
• Include recommender's credentials and relationship to you

**📂 Evidence Portfolio (Maximum 10 Items - Must Meet 2+ Criteria)**

**Criterion 1: Exceptional Talent/Promise in Digital Technology**
*Evidence of recognition by experts as leading or emerging leader*

**Acceptable Evidence:**
• Awards or prizes for excellence in digital technology
• Speaking engagements at major technology conferences/events
• Participation in high-profile technology competitions
• Recognition by technology publications or industry bodies
• Invitation to judge technology awards or competitions
• Advisory positions with technology companies or government

**Criterion 2: Innovation in Digital Technology**
*Evidence of innovation as founder, senior executive, board member, or employee*

**Acceptable Evidence:**
• Patents for technology innovations you've developed
• Evidence of commercial success of technology products you've developed
• Leadership roles in technology companies or major technology projects
• Published research in recognized journals or at major conferences
• Open source contributions with significant adoption
• Technology thought leadership through publications or speaking

**Criterion 3: Technical Expertise**
*Evidence of exceptional technical skills in digital technology*

**Acceptable Evidence:**
• Advanced technical qualifications or certifications
• Published research or technical papers
• Recognition from peers for technical expertise
• Technical contributions to major projects with measurable impact
• Development of widely-used technical standards or frameworks
• Teaching or training roles at recognized institutions

**Criterion 4: Academic Excellence**
*Evidence of academic excellence in digital technology field*

**Acceptable Evidence:**
• PhD or other advanced degree in relevant field
• Publications in peer-reviewed journals or top-tier conferences
• Academic awards or recognition for research
• Supervision of students or researchers
• Editorial or peer review roles for academic publications
• Research funding or grants received

**📋 Evidence Quality Guidelines**

**Strong Evidence Characteristics:**
• **Recent:** From the last 5 years (some exceptions for major achievements)
• **External:** Recognition from outside your organization
• **Quantifiable:** Includes metrics, numbers, impact measurements
• **Verifiable:** Can be independently confirmed
• **Relevant:** Directly relates to digital technology field

**Evidence Formatting:**
• Each item clearly labeled and explained
• Include context for why this evidence is significant
• Provide links to online verification where possible
• Translate any non-English documents

**🎯 Application Strategy Tips**
• Choose your strongest 2 criteria - don't try to meet all 4
• Quality over quantity - 10 excellent items beats 10 mediocre ones
• Tell a coherent story about your career progression
• Include a mix of different types of evidence
• Focus on recent achievements (last 2-3 years) where possible`;
    }
    
    if (question === 'How long does the entire process take?') {
        return `**Complete UK Global Talent Visa Timeline**

**⏰ Phase 1: Preparation (3-6 months)**

**Evidence Collection (2-4 months)**
• Gather career achievements and quantify impact
• Collect awards, media coverage, speaking invitations
• Document open source contributions, patents, publications
• Prepare business success metrics and project outcomes
• Organize academic papers, technical certifications

**Reference Letter Process (1-3 months)**
• Identify 3 suitable senior referees in your field
• Approach referees with clear briefing on application requirements
• Allow 2-4 weeks per referee to write high-quality letters
• Review letters for completeness and tech focus
• **Start early** - this often takes longer than expected

**Document Drafting (2-4 weeks)**
• Write compelling personal statement (under 1,000 words)
• Create focused CV highlighting tech achievements (3 pages max)
• Prepare online application form and evidence descriptions

**⚖️ Phase 2: Tech Nation Assessment (8-16 weeks)**

**Standard Processing: 8-12 weeks**
• Submit complete application with all evidence
• Tech Nation expert panel reviews application
• Decision: Endorsed, Not Endorsed, or Request for More Information
• If rejected, must wait 6 months before reapplying

**Priority Processing: 3-5 weeks**
• Additional cost: £500-£1,500
• Same thorough review process, expedited timeline
• Recommended only if you have urgent timing needs
• Still same quality requirements and rejection risk

**🏠 Phase 3: Home Office Visa Application (1-8 weeks)**

**Application Requirements:**
• Must have Tech Nation endorsement first
• Complete online visa application
• Attend biometric appointment
• Provide financial evidence
• Pay visa fees and health surcharge

**Processing Times:**
• **Outside UK:** 3 weeks standard, 1 week priority (+£500-800)
• **Inside UK:** 8 weeks standard, 1 week priority (+£500-800)
• **Family members:** Can apply simultaneously or join later

**📊 Realistic Timeline Planning**

**Optimistic Scenario: 5-7 months**
• 3 months preparation + 3-4 weeks priority processing + 1-3 weeks visa
• Requires: Well-prepared evidence, responsive referees, priority processing fees
• Risk: Limited time for corrections if issues arise

**Standard Scenario: 8-12 months**
• 4-5 months preparation + 8-12 weeks standard processing + 3-8 weeks visa  
• Most common timeline for well-organized applicants
• Allows buffer time for unexpected delays

**Conservative Scenario: 12-18 months**
• 6 months preparation + potential reapplication + processing delays
• Accounts for: Referee delays, evidence gaps, application improvements
• Recommended if no urgent UK start date

**🎯 Success Timeline Optimization**

**Start Early Actions:**
• Begin evidence collection 12+ months before desired UK start date
• Contact potential referees 6+ months in advance  
• Research Tech Nation criteria thoroughly before starting

**Parallel Processing:**
• Collect evidence while drafting personal statement
• Contact referees while organizing other documents
• Prepare visa documents during Tech Nation assessment

**Risk Management:**
• Have backup referees identified in case of delays
• Collect more evidence than needed (then select best 10 items)
• Consider priority processing if timeline is critical

**📅 Key Milestones Checklist:**
- [ ] Evidence collection complete
- [ ] All 3 reference letters received and reviewed  
- [ ] Personal statement drafted and refined
- [ ] CV finalized at 3 pages max
- [ ] Tech Nation application submitted
- [ ] Endorsement received
- [ ] Home Office visa application submitted
- [ ] Biometric appointment completed
- [ ] Visa approved and ready for UK arrival

**⚠️ Common Delays to Avoid:**
• Waiting for referee letters (start early!)
• Weak evidence requiring strengthening
• Incomplete application requiring resubmission  
• Missing Tech Nation formatting requirements
• Home Office document requests for clarification`;
    }
    
    return "Corresponding prepared answer not found.";
}

// Fallback for non-guided questions
function getSimpleFallback(message) {
    return `I'd be happy to help with your UK Global Talent Visa question!

**Core Information:**
• **Purpose:** For exceptional talent/promise in digital technology
• **Duration:** 5 years, path to settlement after 3 years  
• **Cost:** £766 application + £5,175 health surcharge per person
• **Timeline:** 6-12 months total process
• **Requirements:** 5+ years experience, meet 2/4 evidence criteria

**Key Topics I Can Help With:**
• Eligibility requirements and which route suits you
• Complete application process and all costs
• Document preparation and evidence requirements  
• Timeline planning and processing expectations
• Specific advice based on your background

Please feel free to ask about any specific aspect of the application process!`;
=======
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
>>>>>>> f1030aa399405e9f6e035f37c9717c58678c8ffb
}