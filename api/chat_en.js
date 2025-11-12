// api/chat-en.js - Fast responses with fallback answers
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

        // PRIORITY 1: Check for guided questions - return instantly
        const guidedAnswer = getGuidedAnswer(message);
        if (guidedAnswer) {
            return res.status(200).json({ response: guidedAnswer });
        }

        // PRIORITY 2: Try AI only for custom questions with resume data
        if ((resumeContent || resumeAnalysis) && process.env.OPENROUTER_API_KEY) {
            try {
                const aiResponse = await getAIResponse(message, resumeContent, resumeAnalysis);
                if (aiResponse) {
                    return res.status(200).json({ response: aiResponse });
                }
            } catch (error) {
                console.log('AI failed, using fallback:', error.message);
            }
        }

        // PRIORITY 3: Always return fallback
        return res.status(200).json({ 
            response: getSimpleFallback(message)
        });

    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(200).json({ 
            response: getSimpleFallback(req.body?.message || '')
        });
    }
}

// Get instant answers for the 4 guided questions
function getGuidedAnswer(message) {
    if (message === 'What are the eligibility requirements for the Digital Technology route?') {
        return `**UK Global Talent Visa - Digital Technology Eligibility**

**Two Application Routes:**

🌟 **Exceptional Talent (Leader Route)**
• For recognized industry leaders
• Typically 5+ years experience
• Must demonstrate leadership and recognition

🚀 **Exceptional Promise (Emerging Leader Route)**
• For emerging leaders with high potential
• Often less than 5 years in tech
• Focus on demonstrating future leadership potential

**Who Can Apply:**

✅ **Technical Applicants** (from any organization):
• Software engineers/developers
• DevOps/SysOps engineers
• Data scientists/engineers
• AI/ML/NLP experts
• Cybersecurity professionals
• Hardware engineers

✅ **Business Applicants** (from tech organizations):
• Product managers
• Growth/commercial leads
• Solution sales experts
• VC investment professionals (£25m+)
• Performance marketing leaders

❌ **Not Eligible:**
• Business roles in non-tech companies
• Using technology vs. working IN technology

**Key Assessment Criteria:**
Must meet at least 2 of 4 criteria:
1. Industry recognition (awards, media, speaking)
2. Technical competence (open source, patents, papers)
3. Academic/business success (publications, revenue)
4. Innovation leadership (new technologies, breakthroughs)

**Next Steps:** Assess your experience level and prepare evidence for 2+ criteria.`;
    }
    
    if (message === 'How does the Tech Nation application process work? Please include all costs.') {
        return `**Complete Application Process & Costs**

**Two-Stage Process:**

**Stage 1: Tech Nation Endorsement**
• Who: Tech Nation (independent assessment body)
• Fee: £561 (non-refundable)
• Time: 8-12 weeks standard / 3-5 weeks fast-track
• Fast-track fee: +£500-£1,500
• Submit: Complete evidence package online

**Stage 2: Home Office Visa**
• Who: UK Home Office
• Fee: £205
• Time: 3 weeks (outside UK) / 8 weeks (inside UK)
• Requirement: Must have Tech Nation endorsement first
• Includes: Biometric appointment, medical checks

**Complete Cost Breakdown:**

Main Applicant:
• Tech Nation fee: £561
• Visa application: £205
• Healthcare surcharge (5 years): £5,175
• **Total: £5,941**

Each Dependent (spouse/child):
• Visa application: £205
• Healthcare surcharge (5 years): £5,175
• **Per person: £5,380**

Optional Upgrades:
• Tech Nation fast-track: £500-£1,500
• Home Office priority: £500-£800

**Example Total Costs:**
• Single applicant: £5,941
• With spouse: £11,321
• With spouse + 2 children: £22,081

**Timeline:** 6-10 months total (preparation + processing)

**Money-Saving Tip:** Use standard processing unless urgent deadline.`;
    }
    
    if (message === 'What documents and evidence do I need to prepare?') {
        return `**Complete Document & Evidence Checklist**

**Mandatory Documents (Everyone):**

1. **Valid Passport** or national ID card

2. **CV (3 pages maximum)**
   • Focus on digital technology career
   • Include quantifiable achievements
   • Highlight leadership and impact

3. **Personal Statement (1,000 words max)**
   • How you meet the criteria
   • Your work in digital technology
   • Plans and contributions in the UK

4. **3 Recommendation Letters**
   • From recognized leaders in digital tech
   • Must know your work personally
   • Written specifically for this application
   • Include recommender's credentials and achievements

**Evidence Portfolio (10 items max, meet 2+ criteria):**

**Criterion 1 - Industry Recognition:**
• Media coverage about your work (tech publications, interviews)
• Speaking invitations at major conferences
• Industry awards and honors
• Advisory board or expert committee positions
• Citations in industry reports

**Criterion 2 - Technical Competence:**
• Open source contributions (GitHub stars, downloads)
• Published technical papers (journals, conferences)
• Granted patents
• Peer recognition and citations
• Technical leadership in major projects

**Criterion 3 - Academic/Business Success:**
• Research publications and citations
• Product success metrics (users, growth)
• Revenue/business results you led
• Major partnerships or contracts
• Successful fundraising rounds

**Criterion 4 - Innovation Leadership:**
• Development of new technologies
• Significant improvements to existing tech
• Digital transformation projects
• Novel solutions with industry impact
• Technical breakthroughs

**Evidence Quality Tips:**
• External > Internal recognition
• Numbers > Descriptions
• Recent (last 5 years) > Old
• Third-party verification > Self-claims

**Next Step:** Map your achievements to 2-3 strongest criteria.`;
    }
    
    if (message === 'How long does the entire process take?') {
        return `**Complete Timeline Breakdown**

**Phase 1: Preparation (3-6 months)**

Evidence Collection (2-4 months):
• Gather career achievements and metrics
• Collect media coverage, awards, certificates
• Compile open source stats, patents, papers
• Document business success cases

Recommendation Letters (1-2 months):
• Identify 3 suitable recommenders
• Contact and brief them
• Wait for customized letters
• Review and ensure quality

Document Writing (2-4 weeks):
• Draft personal statement (1,000 words)
• Polish CV (3 pages)
• Complete online application form

**Phase 2: Official Processing**

Tech Nation Review:
• Standard: 8-12 weeks
• Fast-track: 3-5 weeks (+£500-£1,500)
• Decision: Approve or Reject
• If rejected: 6-month wait to reapply

Home Office Visa:
• Outside UK: 3 weeks
• Inside UK: 8 weeks  
• Priority service: 1 week (+£500-£800)
• Biometric appointment: 1-2 weeks

**Total Timeline Examples:**

⚡ **Fastest Path:** 4-5 months
(3 months prep + fast-track processing)

📅 **Standard Path:** 7-9 months
(4 months prep + standard processing)

🛡️ **Conservative:** 10-12 months
(includes buffer for revisions/delays)

**Timeline Tips:**

• Visa starts from approval date (not entry date)
• Can apply from inside or outside UK
• For specific UK entry date, start 12+ months ahead
• Work on evidence and letters in parallel
• Fast-track if time-sensitive

**Critical Dates:**
• Tech Nation decision: Make or break point
• If approved: Home Office is straightforward
• If rejected: 6-month wait penalty

**Recommendation:** Start NOW if planning UK move within 12 months.`;
    }
    
    return null;
}

// Try AI with short timeout
async function getAIResponse(message, resumeContent, resumeAnalysis) {
    const client = getClient();
    if (!client) return null;

    let systemPrompt = `You are a UK Global Talent Visa expert for Digital Technology. Provide detailed, personalized advice in English.`;
    
    if (resumeContent || resumeAnalysis) {
        systemPrompt += `\n\nUser's Profile:`;
        if (resumeAnalysis) {
            if (resumeAnalysis.name) systemPrompt += `\n- Name: ${resumeAnalysis.name}`;
            if (resumeAnalysis.currentRole) systemPrompt += `\n- Current Role: ${resumeAnalysis.currentRole}`;
            if (resumeAnalysis.company) systemPrompt += `\n- Current Company: ${resumeAnalysis.company}`;
            if (resumeAnalysis.skills?.length) systemPrompt += `\n- Key Skills: ${resumeAnalysis.skills.join(', ')}`;
            if (resumeAnalysis.estimatedYears > 0) systemPrompt += `\n- Years of Experience: ${resumeAnalysis.estimatedYears} years`;
            if (resumeAnalysis.previousRoles?.length) {
                systemPrompt += `\n- Previous Roles: ${resumeAnalysis.previousRoles.slice(0, 3).map(r => `${r.title} at ${r.company}`).join('; ')}`;
            }
        }
        if (resumeContent) systemPrompt += `\n\nFull Resume Content:\n${resumeContent.substring(0, 1500)}`;
        
        systemPrompt += `\n\nIMPORTANT RESPONSE REQUIREMENTS:
1. START by greeting them by name and acknowledging their current position and company
2. Analyze their most recent role in detail - what specific achievements, technologies, or metrics from this role can strengthen their visa application
3. Recommend which route they should apply for (Exceptional Talent vs Exceptional Promise) based on their experience level
4. Identify their 2 strongest evaluation criteria with specific examples from their resume
5. Provide 3-5 concrete next actions with specifics from their background
6. Be warm, personalized, and reference specific details from their experience

Format: Use paragraphs and bullet points. Be thorough but organized.`;
    }

    // Try models with longer timeout for resume analysis
    const models = [
        "openai/gpt-oss-20b:free",
        "google/gemini-2.0-flash-exp:free",
        "deepseek/deepseek-chat-v3.1:free"
    ];
    
    for (const model of models) {
        try {
            const completion = await Promise.race([
                client.chat.completions.create({
                    model: model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: message }
                    ],
                    max_tokens: 1500,
                    temperature: 0.7,
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 25000))
            ]);
            console.log(`AI success with ${model}`);
            return completion?.choices[0]?.message?.content;
        } catch (err) {
            console.log(`${model} failed: ${err.message}`);
            // Continue to next model
        }
    }
    return null;
}

// Fast fallback responses
function getSimpleFallback(message) {
    const q = message.toLowerCase();
    
    if (q.includes('eligibility') || q.includes('requirements') || q.includes('qualify')) {
        return `**UK Global Talent Visa - Quick Overview**

**Two Routes:**
• **Exceptional Talent** - Recognized leaders (5+ years)
• **Exceptional Promise** - Emerging leaders (<5 years typical)

**Who Qualifies:**
• Tech roles in tech companies ✅
• Business roles in tech companies ✅
• Must work IN digital tech (not just use it)

**Need to prove:** 2 of 4 criteria with strong evidence

Click the guided questions above for detailed eligibility info!`;
    }
    
    if (q.includes('process') || q.includes('cost') || q.includes('fee') || q.includes('price')) {
        return `**Quick Process Overview**

**Two Stages:**
1. Tech Nation: £561, 8-12 weeks
2. Home Office: £205, 3-8 weeks

**Total:** £5,941 (including £5,175 healthcare)
**Timeline:** 6-10 months

Use guided questions above for complete cost breakdown!`;
    }
    
    if (q.includes('document') || q.includes('evidence') || q.includes('proof')) {
        return `**Documents Needed**

**Mandatory:**
• CV (3 pages)
• Personal statement (1,000 words)
• 3 recommendation letters

**Evidence:** 10 items proving 2+ criteria
• Industry recognition
• Technical competence
• Business success
• Innovation

Click guided question above for detailed checklist!`;
    }
    
    if (q.includes('time') || q.includes('long') || q.includes('month') || q.includes('week')) {
        return `**Timeline Overview**

**Preparation:** 3-6 months
**Tech Nation:** 8-12 weeks
**Home Office:** 3-8 weeks

**Total:** 6-10 months standard

Use guided question above for detailed timeline!`;
    }
    
    return `**UK Global Talent Visa Assistant**

I can help with:
• Eligibility requirements
• Application process & costs
• Required documents & evidence
• Timeline planning
• Personalized advice (upload your resume!)

**Quick Facts:**
• No employer needed
• 5-year visa
• £5,941 total cost
• 6-10 month process

Click the guided questions above or ask me anything!`;
}