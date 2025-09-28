// api/chat-en.js - Enhanced with proper resume analysis
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

        // Log resume information for debugging
        console.log('=== RESUME ANALYSIS DEBUG ===');
        console.log('Message:', message.substring(0, 100));
        console.log('Has resumeContent:', !!resumeContent);
        console.log('Has resumeAnalysis:', !!resumeAnalysis);
        if (resumeContent) {
            console.log('Resume content length:', resumeContent.length);
            console.log('Resume excerpt:', resumeContent.substring(0, 300));
        }
        if (resumeAnalysis) {
            console.log('Resume analysis:', JSON.stringify(resumeAnalysis, null, 2));
        }
        console.log('=== END RESUME DEBUG ===');

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
                
                if (resumeContent || resumeAnalysis) {
                    systemPrompt += `\n\nUSER'S BACKGROUND INFORMATION:`;
                    
                    if (resumeAnalysis && resumeAnalysis.recentPositions && resumeAnalysis.recentPositions.length > 0) {
                        systemPrompt += `\n- Current/Recent Positions: ${resumeAnalysis.recentPositions.slice(0, 2).join(', ')}`;
                    }
                    
                    if (resumeAnalysis && resumeAnalysis.skills && resumeAnalysis.skills.length > 0) {
                        systemPrompt += `\n- Technical Skills: ${resumeAnalysis.skills.slice(0, 10).join(', ')}`;
                    }
                    
                    if (resumeAnalysis && resumeAnalysis.companies && resumeAnalysis.companies.length > 0) {
                        systemPrompt += `\n- Companies: ${resumeAnalysis.companies.join(', ')}`;
                    }
                    
                    if (resumeContent) {
                        const resumeExcerpt = resumeContent.substring(0, 1000);
                        systemPrompt += `\n\nResume Summary: ${resumeExcerpt}`;
                    }
                    
                    systemPrompt += `\n\nIMPORTANT: Base your advice on this specific background. Reference their actual positions, companies, and skills when making recommendations. Provide personalized guidance that relates directly to their experience.`;
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
                        max_tokens: 1200,
                        temperature: 0.7,
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 15000)
                    )
                ]);
                console.log(`Successfully used model: ${model}`);
                
                // Log AI response for debugging
                const aiResponse = completion.choices[0]?.message?.content;
                if (aiResponse && (resumeContent || resumeAnalysis)) {
                    console.log('=== AI RESPONSE WITH RESUME ===');
                    console.log('Response length:', aiResponse.length);
                    console.log('Response preview:', aiResponse.substring(0, 500));
                    console.log('=== END AI RESPONSE ===');
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

// Get prepared answers for the 4 guided questions
function getPreparedAnswer(question) {
    if (question === 'What are the eligibility requirements for the Digital Technology route?') {
        return `UK Global Talent Visa Eligibility Requirements:

**Basic Requirements:**
• **Experience**: At least 5 years of relevant work experience in digital technology
• **Work Nature**: Must be working IN digital technology, not just using it
• **Age Limit**: No age requirements
• **Education**: No minimum educational qualifications required

**Two Application Routes:**

🌟 **Exceptional Talent Route**
• For industry-recognized senior professionals
• Significant achievements and impact in digital technology
• Usually suitable for applicants with 10+ years experience

⭐ **Exceptional Promise Route**  
• For those showing exceptional potential as early career professionals
• Shows potential to become future leaders despite less experience
• Usually suitable for applicants with 5-10 years experience

**Assessment Requirements:**
• Must meet all mandatory criteria (passport, CV, personal statement, references)
• Must meet at least 2 out of 4 optional criteria

**Suitable Career Fields:**
• Software Development & Engineering • AI & Machine Learning • Data Science • Cybersecurity
• Product Management • Technical Leadership • Blockchain • Cloud Architecture

**Next Step Assessment:** Confirm your work responsibilities are in core digital technology, not support or user roles.`;
    }
    
    if (question === 'How does the Tech Nation application process work? Please include all costs.') {
        return `Complete Tech Nation Application Process & Costs:

📋 **Two-Stage Application Process**

**Stage 1: Tech Nation Endorsement Application**
• **Apply to**: Tech Nation (independent technology assessment body)
• **Application Fee**: £561 (non-refundable)
• **Processing Time**: 8-12 weeks (standard), 3-5 weeks (fast-track +£500-£1,500)
• **Application Method**: Online portal submission
• **Requirements**: Submit complete evidence portfolio and all documents

**Stage 2: Home Office Visa Application**
• **Apply to**: UK Home Office Immigration
• **Application Fee**: £205
• **Processing Time**: 3 weeks (outside UK), 8 weeks (inside UK)  
• **Prerequisites**: Must first obtain Tech Nation endorsement
• **Additional Requirements**: Biometric appointment, health checks

💰 **Detailed Cost Breakdown**

**Main Applicant Costs:**
• Tech Nation Endorsement Fee: £561
• Home Office Visa Fee: £205
• Healthcare Surcharge (5 years): £5,175
• **Main Applicant Total: £5,941**

**Dependent Costs (spouse + children):**
• Per person visa fee: £205
• Per person healthcare surcharge (5 years): £5,175
• **Per dependent: £5,380**

**Optional Fast-Track Fees:**
• Tech Nation Fast-Track Processing: £500-£1,500
• Home Office Priority Service: £500-£800

📅 **Application Timeline Planning:**
1. Material Preparation: 3-6 months
2. Tech Nation Application: 8-12 weeks processing
3. Home Office Visa: 3-8 weeks processing
4. **Total Timeline: 6-10 months**

💡 **Cost-Saving Tips:** Choose standard processing times, ensure materials are complete to avoid reapplication.`;
    }
    
    if (question === 'What documents and evidence do I need to prepare?') {
        return `Complete Document & Evidence Checklist:

📄 **Mandatory Documents (All Applicants Must Provide)**

**1. Passport or National Identity Document**

**2. Curriculum Vitae (Maximum 3 pages)**
• Focus on digital technology career progression
• Include quantified achievements and impact data

**3. Personal Statement (Maximum 1,000 words)**
• Explain how you meet the application criteria
• Describe your specific work in digital technology
• Outline your plans in the UK

**4. Reference Letters (3 letters)**
• From recognized professionals in digital technology field
• Referees must understand your work and achievements
• Written specifically for this application, including full referee credentials

📂 **Evidence Portfolio (Maximum 10 items, must meet at least 2 criteria)**

**Criterion 1 - External Industry Recognition:**
• Mainstream media coverage and interviews about your work
• Speaking invitations at major technology conferences
• Industry awards, honors, and recognition
• Expert panel positions, advisory roles
• Expert citations in industry reports

**Criterion 2 - Technical Expertise:**
• Open source contribution statistics (GitHub stars, forks, downloads)
• Technical papers published in recognized journals/conferences
• Obtained technical patents
• Technical recognition and citations by peer experts
• Leadership roles in significant technical projects

**Criterion 3 - Academic Contributions or Business Success:**
• Academic research papers and citation metrics
• Product launch success metrics and user data
• Direct responsibility for revenue growth and business outcomes
• Major business partnerships and collaboration agreements
• Successful funding or investment cases

**Criterion 4 - Technical Innovation:**
• Development of new technologies or methodologies
• Significant improvements to existing technologies
• Leadership in digital transformation projects
• Implementation of innovative solutions
• Technical breakthroughs with industry impact

📋 **Evidence Quality Standards:**
• External recognition > Internal recognition
• Quantified data > Qualitative descriptions
• Recent evidence > Historical achievements (prioritize last 5 years)
• Third-party verification > Self-declaration`;
    }
    
    if (question === 'How long does the entire process take?') {
        return `Complete UK Global Talent Visa Timeline:

⏰ **Preparation Phase: 3-6 months**

**Material Collection & Organization: 2-4 months**
• Review career achievements and quantify data
• Collect media coverage, award certificates
• Organize open source contributions, patent documents
• Prepare business success cases and data

**Reference Letter Acquisition: 1-2 months**
• Identify and contact 3 suitable referees
• Wait for referees to write specialized recommendation letters
• Ensure letter quality and completeness

**Document Writing: 2-4 weeks**
• Write personal statement (under 1000 words)
• Organize and optimize CV (under 3 pages)
• Prepare online application forms

📋 **Official Processing Phase**

**Tech Nation Endorsement Application:**
• **Standard Processing**: 8-12 weeks
• **Fast-Track Processing**: 3-5 weeks (additional £500-£1,500 required)
• **Decision Types**: Approved/Rejected (if rejected, must wait 6 months to reapply)

**Home Office Visa Application:**
• **UK Outside Application**: 3 weeks
• **UK Inside Application**: 8 weeks
• **Fast-Track Processing**: 1 week (additional £500-£800 required)
• **Biometric Appointment**: Usually scheduled within 1-2 weeks

🗓️ **Overall Timeline Planning**

• **Fastest Case**: 4-5 months
  (3 months preparation + 1-2 months fast-track processing)
• **Standard Case**: 7-9 months
  (4 months preparation + 3-5 months standard processing)
• **Conservative Estimate**: 10-12 months
  (including possible supplementary materials and delays)

📅 **Important Timeline Reminders:**
• Visa validity starts from approval date, not entry date
• Can apply from inside or outside UK, different processing times
• If planning specific entry timing, recommend starting 12 months early

⚡ **Timeline Optimization Tips:**
• Prepare materials and contact referees in parallel
• Research evaluation criteria early, focus on strongest areas
• Consider fast-track processing if urgent timing needed
• Reserve buffer time for possible supplementary material requests`;
    }
    
    return "Corresponding prepared answer not found.";
}

// Fallback for non-guided questions
function getSimpleFallback(message) {
    const query = message.toLowerCase();
    
    // Eligibility queries
    if (query.includes('eligibility') || query.includes('eligible') || query.includes('qualify')) {
        return `UK Global Talent Visa Eligibility:

**Basic Requirements:**
• **Experience**: At least 5 years in digital technology field
• **Work Type**: Must work IN technology, not just use it
• **Age**: No age restrictions
• **Education**: No specific degree requirements

**Two Routes Available:**

1. **Exceptional Talent Route**
• For recognized industry leaders
• Gained industry recognition in past 5 years
• At career maturity stage

2. **Exceptional Promise Route**
• For those with leadership potential as early professionals
• Shown potential in past 5 years
• At early career stage

**Assessment Criteria:**
• Must meet all mandatory criteria
• Must meet at least 2 out of 4 optional criteria

**Next Assessment Step:** Confirm your work is in core digital technology and calculate your relevant experience years.`;
    }
    
    // Default response
    return `UK Global Talent Visa Key Information:

**Application Overview:**
• Professional visa for digital technology sector
• No employer sponsorship required
• 5-year validity, renewable
• Apply for settlement after 3-5 years

**Basic Requirements:**
• 5+ years relevant experience
• Demonstrate exceptional talent or promise
• Meet assessment criteria

**Application Process:**
1. Tech Nation Endorsement (£561, 8-12 weeks)
2. Home Office Visa (£205, 3-8 weeks)

**Total Costs:** £766 + £5,175 healthcare surcharge

**Key Success Factors:**
• External recognition evidence
• Quantified achievement data
• High-quality reference letters
• Clear personal statement

Please tell me what specific aspect you'd like to know more about, and I can provide detailed guidance!`;
}