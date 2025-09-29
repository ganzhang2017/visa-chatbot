// api/chat-en.js - Clean English version matching Chinese functionality
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

        // Diagnostic logging
        console.log('=== DIAGNOSTIC INFO ===');
        console.log('Message:', message.substring(0, 100));
        console.log('Has resumeContent:', !!resumeContent);
        console.log('Has resumeAnalysis:', !!resumeAnalysis);
        if (resumeContent) {
            console.log('Resume content length:', resumeContent.length);
            console.log('Resume content first 300 chars:', resumeContent.substring(0, 300));
        }
        if (resumeAnalysis) {
            console.log('Resume analysis:', resumeAnalysis);
        }
        console.log('=== END DIAGNOSTIC ===');

        // Try working models
        let completion;
        const workingModels = [
            "x-ai/grok-4-fast:free",
            "google/gemini-2.0-flash-exp:free", 
            "deepseek/deepseek-chat-v3.1:free"
        ];

        for (const model of workingModels) {
            try {
                let systemPrompt = `You are a UK Global Talent Visa expert specializing in the Digital Technology route through Tech Nation. Respond in English with specific actionable advice.`;
                
                if (resumeContent || resumeAnalysis) {
                    systemPrompt += `\n\nUser's background information:`;
                    
                    if (resumeAnalysis) {
                        if (resumeAnalysis.currentRole) {
                            systemPrompt += `\n- Current position: ${resumeAnalysis.currentRole}`;
                        }
                        if (resumeAnalysis.company) {
                            systemPrompt += `\n- Current company: ${resumeAnalysis.company}`;
                        }
                        if (resumeAnalysis.skills && resumeAnalysis.skills.length > 0) {
                            systemPrompt += `\n- Key skills: ${resumeAnalysis.skills.join(', ')}`;
                        }
                        if (resumeAnalysis.estimatedYears > 0) {
                            systemPrompt += `\n- Estimated experience: ${resumeAnalysis.estimatedYears} years`;
                        }
                    }
                    
                    if (resumeContent) {
                        systemPrompt += `\n\nResume summary: ${resumeContent.substring(0, 800)}`;
                    }
                    
                    systemPrompt += `\n\nProvide personalized advice based on their specific background. Requirements:\n1. Must mention their current or recent position and company\n2. Judge which route suits them (Exceptional Talent vs Promise)\n3. Recommend strongest 2 evaluation criteria\n4. Provide 3 most important next actions\n\nFormat: Use clear format with • bullets, avoid excessive bold.`;
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
                        max_tokens: 1000,
                        temperature: 0.7,
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 15000)
                    )
                ]);
                console.log(`Successfully used model: ${model}`);
                
                const aiResponse = completion.choices[0]?.message?.content;
                if (aiResponse) {
                    console.log('=== AI RESPONSE DIAGNOSTIC ===');
                    console.log('AI response length:', aiResponse.length);
                    console.log('AI response first 500 chars:', aiResponse.substring(0, 500));
                    console.log('=== END AI RESPONSE DIAGNOSTIC ===');
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
        return `UK Global Talent Visa Eligibility Requirements - Digital Technology Route:

Tech Nation's criteria are designed for applicants with technical and business skills in the digital technology sector.

📋 Applicant Types:

1. **Technical applicants** (e.g. programmers) from non-technical organizations - ✅ Eligible
2. **Business applicants** (e.g. business roles) from technical organizations - ✅ Eligible
3. **Business applicants** from non-technical organizations - ❌ Generally not eligible

🎯 Two Application Routes:

**Leader Route (Exceptional Talent)**
• For recognized industry leaders

**Emerging Leader Route (Exceptional Promise)**
• For emerging or potential leaders
• Typically less than 5 years experience in technology
• Can have had longer career in another field
• Must prove potential to be a leader through skills and achievements

💻 Technical Applicant Requirements:
Must demonstrate proven technical expertise with the latest technologies in building, using, deploying or exploiting a technology stack and building technical infrastructure.

**Examples of Technical Skills:**
• DevOps/SysOps engineers
• Principal software engineers/developers
• Experienced data scientists/data engineers
• Artificial Intelligence, Natural Language Processing and Machine Learning experts
• Cybersecurity experts
• Hardware engineers

💼 Business Applicant Requirements:
Must demonstrate proven commercial, investment, or product expertise in building digital products or leading investments in significant digital product businesses.

**Examples of Business Skills:**
• Experience leading substantial VC investment over £25m GBP
• Experience as commercial/business lead (P&L, growth, sales strategy) in digital businesses
• Experience expanding or growing significant product-led digital technology businesses
• Sector-specific experience (e.g. payment infrastructure in FinTech / international expansion in EdTech)
• Solution sales experts
• Experienced Product Managers
• SaaS or enterprise sales leadership for digital services
• Solution sales for growing B2B digital businesses
• Performance marketing experts for digital businesses

**Key Assessment Points:**
• Must work IN digital technology, not just use digital technology
• Need to demonstrate technical or business expertise with specific evidence
• Focus is on leadership and impact, not just years of experience`;
    }
    
    if (question === 'How does the Tech Nation application process work? Please include all costs.') {
        return `Complete Tech Nation Application Process & Costs:

📋 Two-Stage Application Process

Stage 1: Tech Nation Endorsement Application
• Applicant: Tech Nation (independent technology assessment body)
• Application fee: £561 (non-refundable)
• Processing time: 8-12 weeks (standard), 3-5 weeks (fast-track +£500-£1,500)
• Application method: Online portal submission
• Requirements: Submit complete evidence package and all documents

Stage 2: Home Office Visa Application
• Applicant: UK Home Office Immigration
• Application fee: £205
• Processing time: 3 weeks (outside UK), 8 weeks (inside UK)
• Prerequisite: Must have Tech Nation endorsement first
• Additional requirements: Biometric appointment, medical checks

💰 Detailed Cost Breakdown

Main Applicant Costs:
• Tech Nation endorsement fee: £561
• Home Office visa fee: £205
• Healthcare surcharge (5 years): £5,175
• Main applicant total: £5,941

Dependent Costs (spouse + children):
• Per person visa fee: £205
• Per person healthcare surcharge (5 years): £5,175
• Per dependent: £5,380

Optional Fast-Track Costs:
• Tech Nation fast-track processing: £500-£1,500
• Home Office priority service: £500-£800

📅 Application Timeline:
1. Materials preparation: 3-6 months
2. Tech Nation application: 8-12 weeks processing
3. Home Office visa: 3-8 weeks processing
4. Total time: 6-10 months

💡 Cost-Saving Tips: Choose standard processing time, ensure materials are complete to avoid reapplication.`;
    }
    
    if (question === 'What documents and evidence do I need to prepare?') {
        return `Complete Application Documents and Evidence Checklist:

📄 Mandatory Documents (All applicants must provide)

1. Passport or national identity card
2. Personal CV (maximum 3 pages)
   • Highlight career development in digital technology
   • Include quantifiable achievements and impact data
3. Personal statement (maximum 1,000 words)
   • Explain how you meet application criteria
   • Describe specific work in digital technology
   • Outline plans in the UK
4. Recommendation letters (3 letters)
   • From recognized leaders in digital technology
   • Recommenders must know your work and achievements
   • Written specifically for this application, including recommender's full credentials

📂 Evidence Portfolio (maximum 10 items, must meet at least 2 criteria)

Criterion 1 - Industry External Recognition:
• Mainstream media coverage and interviews about your work
• Invitations to speak at major technology conferences
• Industry awards, honors and recognition
• Expert committee or advisory positions
• Citations in industry reports

Criterion 2 - Technical Professional Competence:
• Open source project contribution statistics (GitHub stars, forks, downloads)
• Technical papers published in recognized journals or conferences
• Obtained technology patents
• Recognition and citations from expert peers
• Leadership roles in major technical projects

Criterion 3 - Academic Contributions or Business Success:
• Academic research papers and citation records
• Product launch success indicators and user data
• Revenue growth and business results you directly led
• Major business partnership agreements
• Financing or investment success cases

Criterion 4 - Technology Innovation:
• Development of new technologies or methodologies
• Major improvements to existing technologies
• Leadership in digital transformation projects
• Implementation of innovative solutions
• Technical breakthroughs and industry impact

📋 Evidence Quality Standards:
• External recognition > Internal recognition
• Quantitative data > Qualitative descriptions
• Recent evidence > Historical achievements (prefer last 5 years)
• Third-party verification > Self-declaration`;
    }
    
    if (question === 'How long does the entire process take?') {
        return `Complete UK Global Talent Visa Timeline:

⏰ Preparation Phase: 3-6 months

Materials Collection and Organization: 2-4 months
• Review career achievements and quantitative data
• Collect media coverage, award certificates
• Organize open source contributions, patent documents
• Prepare business success cases and data

Recommendation Letter Process: 1-2 months
• Identify and contact 3 suitable recommenders
• Wait for recommenders to write specialized letters
• Ensure quality and completeness of letters

Document Writing: 2-4 weeks
• Write personal statement (within 1000 words)
• Organize and optimize CV (within 3 pages)
• Prepare online application form

📋 Official Processing Phase

Tech Nation Endorsement Application:
• Standard processing: 8-12 weeks
• Fast-track processing: 3-5 weeks (additional £500-£1,500)
• Decision type: Approve/Reject (if rejected, can only reapply after 6 months)

Home Office Visa Application:
• Outside UK application: 3 weeks
• Inside UK application: 8 weeks
• Fast-track processing: 1 week (additional £500-£800)
• Biometric appointment: Usually scheduled within 1-2 weeks

🗓️ Overall Timeline Planning

• Fastest case: 4-5 months
  (3 months preparation + 1-2 months fast-track processing)
• Standard case: 7-9 months
  (4 months preparation + 3-5 months standard processing)
• Conservative estimate: 10-12 months
  (Including possible materials supplementation and delays)

📅 Key Time Reminders:
• Visa validity starts from approval date, not entry date
• Can apply from inside or outside UK, different processing times
• If planning specific entry time to UK, recommend starting preparation 12 months in advance

⚡ Timeline Optimization Tips:
• Prepare materials and contact recommenders in parallel
• Research evaluation criteria in advance, focus on strongest areas
• Consider fast-track processing if urgent time needs
• Reserve buffer time for possible supplementary material requests`;
    }
    
    return "Corresponding prepared answer not found.";
}

// Fallback for non-guided questions
function getSimpleFallback(message) {
    const query = message.toLowerCase();
    
    if (query.includes('eligibility') || query.includes('requirements') || query.includes('qualify')) {
        return `UK Global Talent Visa Eligibility:

Basic Requirements:
• Experience requirement: At least 5 years work experience in digital technology field
• Work nature: Must work IN digital technology field, not just use technology
• Age requirement: No age limit
• Education requirement: No specific degree requirements

Two Application Routes:

1. Exceptional Talent Route
• For recognized industry leaders
• Gained industry recognition in past 5 years
• At mature career stage

2. Exceptional Promise Route
• For early career professionals with leadership potential
• Demonstrated potential in past 5 years
• At early career stage

Assessment Criteria:
• Must meet all mandatory criteria
• Must meet at least 2 of 4 optional criteria

Next step assessment: Confirm your work is truly in digital technology field core, calculate your relevant experience years.`;
    }
    
    return `UK Global Talent Visa Core Information:

Application Overview:
• Professional visa for digital technology field
• No employer sponsorship required
• 5 year validity, renewable
• Can apply for settlement after 3-5 years

Basic Requirements:
• 5+ years relevant experience
• Prove exceptional talent or potential
• Meet assessment criteria

Application Process:
1. Tech Nation endorsement (£561, 8-12 weeks)
2. Home Office visa (£205, 3-8 weeks)

Total cost: £766 + £5,175 healthcare surcharge

Key Success Factors:
• External recognition evidence
• Quantifiable achievement data
• High-quality recommendation letters
• Clear personal statement

Please tell me which specific aspect you'd like to know more about, and I can provide more detailed guidance!`;
}