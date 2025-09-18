// api/chat.js - Fixed for Vercel Serverless
export default async function handler(req, res) {
    // Set CORS headers first
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-cache');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowedMethods: ['POST']
        });
    }

    try {
        // Log the incoming request for debugging
        console.log('Incoming request method:', req.method);
        console.log('Request body exists:', !!req.body);
        
        // Parse the request body safely
        let body;
        if (typeof req.body === 'string') {
            body = JSON.parse(req.body);
        } else {
            body = req.body || {};
        }

        const { message, userId } = body;
        console.log('Parsed message:', message?.substring(0, 50));

        // Validate required fields
        if (!message || typeof message !== 'string') {
            console.log('Missing or invalid message field');
            return res.status(400).json({ 
                error: 'Missing or invalid message field',
                received: typeof message
            });
        }

        // Handle test connection first
        if (message.trim() === 'test connection') {
            console.log('Test connection request received');
            return res.status(200).json({ 
                response: 'API connection successful! Tech Nation assistant is ready 🚀',
                timestamp: new Date().toISOString()
            });
        }

        // Process the message
        const query = message.toLowerCase().trim();
        let response = '';

        // Cost-related queries
        if (query.includes('cost') || query.includes('fee') || query.includes('price') || query.includes('money')) {
            response = `**💰 Tech Nation Application Costs:**

**Stage 1: Tech Nation Endorsement**
• Application fee: £561

**Stage 2: Home Office Visa**
• Visa application fee: £205
• Healthcare surcharge: £1,035 per year

**📊 Total for main applicant (first year):**
• Initial costs: £766 (£561 + £205)
• Healthcare surcharge: £1,035
• **Grand total: £1,801**

**👨‍👩‍👧‍👦 For dependants:**
• Each dependant pays: £766
• Plus healthcare surcharge: £1,035 each

**💡 Additional costs to consider:**
• Priority processing (optional): £500-£1,000
• Biometric appointment: ~£19.20
• Document translation: £50-£200

Would you like information about payment schedules or fee waivers?`;

        // Process and timeline queries
        } else if (query.includes('process') || query.includes('step') || query.includes('how') || query.includes('timeline')) {
            response = `**🚀 Tech Nation Application Process:**

**Phase 1: Preparation (2-6 months)**
1. Gather evidence portfolio
2. Secure 3 recommendation letters
3. Write personal statement (1,000 words max)
4. Prepare CV highlighting tech achievements

**Phase 2: Tech Nation Endorsement (8-12 weeks)**
1. Submit online application (£561)
2. Tech Nation expert panel review
3. Receive endorsement decision
4. Get endorsement letter if successful

**Phase 3: Home Office Visa (3-8 weeks)**
1. Submit visa application (£205)
2. Pay healthcare surcharge (£1,035/year)
3. Attend biometric appointment
4. Wait for visa decision

**⏰ Total Timeline: 4-8 months**

**🚄 Speed up options:**
• Priority Tech Nation review: Extra cost
• Premium visa processing: £500-£1,000

**📝 Next steps:** Are you ready to start gathering evidence, or do you need help with eligibility requirements?`;

        // Evidence and documentation queries
        } else if (query.includes('evidence') || query.includes('document') || query.includes('proof') || query.includes('portfolio')) {
            response = `**📄 Evidence Requirements for Tech Nation:**

**📋 Mandatory Documents (All applicants):**
• CV highlighting digital tech career
• Personal statement (max 1,000 words)
• 3 recommendation letters from tech leaders
• Valid passport/ID

**🎯 Optional Evidence (Need 2 of 4 criteria):**

**1. Recognition Beyond Your Job**
• Media coverage in major publications
• Speaking at significant conferences
• Industry awards and honors
• Advisory board positions

**2. Technical Expertise**
• Open source contributions (GitHub stars/forks)
• Technical publications or patents
• Recognition from expert peers
• Thought leadership content

**3. Academic/Commercial Success**
• Published research with citations
• Product launches with measurable impact
• Revenue growth achievements
• Successful startup exits

**4. Innovation Leadership**
• Leading new technology development
• Digital transformation initiatives
• Creating new methodologies
• Breakthrough technical solutions

**💡 Evidence Tips:**
• Maximum 10 pieces of evidence total
• Focus on external recognition and impact
• Include quantifiable metrics where possible
• Recent evidence preferred (last 5 years)

Which criteria do you think align best with your background?`;

        // Eligibility queries
        } else if (query.includes('eligib') || query.includes('qualify') || query.includes('requirement') || query.includes('criteria')) {
            response = `**✅ Tech Nation Eligibility Requirements:**

**🎯 Two Routes Available:**

**Exceptional Talent** (Established Leaders)
• Recognized as leading talent in last 5 years
• Sustained track record of achievements
• Strong evidence of industry impact

**Exceptional Promise** (Emerging Leaders)
• Potential to become leading talent
• Early career stage professionals
• Demonstrated emerging expertise

**📊 Basic Requirements (All Applicants):**
• Minimum 5 years in digital technology sector
• Work IN digital tech (not just using tech tools)
• Meet mandatory criteria + 2 optional criteria

**💻 Common Qualifying Roles:**
• Senior Software Engineers/Architects
• CTOs, VPs of Engineering
• Data Scientists, AI/ML Engineers
• Cybersecurity Specialists
• Digital Product Managers
• Tech Startup Founders/Co-founders
• DevOps/Platform Engineers

**⚠️ Less Suitable Roles:**
• IT support, system administration
• Generic project management
• Sales roles (unless in tech companies)
• Consulting (unless deep tech expertise)

**❓ Quick Check:**
• Do you have 5+ years in digital technology?
• Can you demonstrate innovation or leadership?
• Do you have external recognition in your field?

Which route seems more applicable to your experience level?`;

        // Recommendation letter queries
        } else if (query.includes('recommend') || query.includes('letter') || query.includes('reference')) {
            response = `**📝 Recommendation Letters Guide:**

**📊 Requirements:**
• Exactly 3 letters required
• From established digital technology leaders
• Written specifically for your Tech Nation application
• Must demonstrate knowledge of your work

**👥 Ideal Recommenders:**
• Senior executives at tech companies (CTO, VP Engineering)
• Recognized experts in your technology field
• Published researchers in digital technology
• Award-winning tech professionals
• Successful tech entrepreneurs
• Leaders of major open source projects

**✍️ Letter Content Should Include:**
• How they know you and your work
• Specific examples of your achievements
• Why you qualify as exceptional talent/promise
• Your impact on the digital technology sector
• Their own credentials and expertise

**🚫 Avoid These Mistakes:**
• Generic, template letters
• Recommenders outside tech industry
• People who don't know your work personally
• Missing recommender contact details
• Letters focused only on soft skills

**💡 Pro Tips:**
• Give recommenders 4-6 weeks notice
• Provide them with your CV and achievement summary
• Suggest specific projects/achievements to highlight
• Follow up politely if needed

Do you have potential recommenders in mind? Would you like help identifying suitable people in your network?`;

        // Timeline specific queries
        } else if (query.includes('time') || query.includes('long') || query.includes('when') || query.includes('duration')) {
            response = `**⏰ Detailed Timeline Breakdown:**

**📋 Evidence Preparation: 2-6 months**
• Gathering documents and proof: 4-8 weeks
• Writing personal statement: 2-3 weeks
• Securing recommendation letters: 4-6 weeks
• Portfolio compilation: 1-2 weeks

**🏢 Tech Nation Review: 8-12 weeks**
• Standard processing time
• Expert panel assessment
• May request additional information
• Priority service available for extra cost

**🏛️ Home Office Processing: 3-8 weeks**
• Outside UK applications: ~3 weeks
• Inside UK applications: ~8 weeks
• Priority services available: 1-5 working days
• Super priority available: Next working day

**📊 Total Process: 4-8 months typical**

**🚄 Ways to Speed Up:**
• Start evidence gathering immediately
• Use priority processing services
• Ensure all documents are complete first time
• Have backup recommenders ready

**📅 Planning Your Application:**
• Start 6+ months before you need the visa
• Allow extra time for complex evidence
• Consider seasonal processing delays
• Book priority services early if needed

What's your target timeline for moving to the UK?`;

        // Default helpful response
        } else {
            response = `**🇬🇧 UK Global Talent Visa - Tech Nation Assistant**

I can help you understand the Tech Nation endorsement process! Here's what I can explain:

**💰 Costs & Fees**
"What does it cost?" - Complete breakdown of all fees

**🚀 Application Process** 
"How does the process work?" - Step-by-step guidance

**📄 Evidence Requirements**
"What evidence do I need?" - Documentation and portfolio guide

**✅ Eligibility Criteria**
"Am I eligible?" - Requirements and qualifying roles

**⏰ Timeline & Processing**
"How long does it take?" - Detailed timeline expectations

**📝 Recommendation Letters**
"How do I get recommendation letters?" - Finding the right endorsers

**🎯 Quick Start Questions:**
• "What are the total costs?"
• "Am I eligible with 6 years as a senior developer?"
• "What evidence do I need for the technical expertise criteria?"
• "How long will the whole process take?"

What specific aspect of the Tech Nation application would you like to explore?`;
        }

        // Log successful response
        console.log('Sending response, length:', response.length);

        return res.status(200).json({ 
            response: response,
            success: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        // Enhanced error logging
        console.error('Chat API Error Details:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Request method:', req.method);
        console.error('Request body type:', typeof req.body);

        return res.status(200).json({ 
            response: 'I encountered an error processing your request. Please try asking about costs, process, evidence, eligibility, or timeline.',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            success: false,
            timestamp: new Date().toISOString()
        });
    }
}