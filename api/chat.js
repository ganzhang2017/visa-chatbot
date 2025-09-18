// api/chat.js - Minimal working version
export default async function handler(req, res) {
    // Add CORS headers
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
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        // Handle test connection
        if (message === 'test connection') {
            return res.status(200).json({ 
                response: 'API connection successful! Tech Nation assistant is ready 🚀' 
            });
        }

        // Simple response logic based on keywords
        const query = message.toLowerCase();
        let response;

        if (query.includes('cost') || query.includes('fee') || query.includes('price')) {
            response = `**Tech Nation Application Costs:**

• Tech Nation endorsement: £561
• Visa application fee: £205
• **Total basic cost: £766**

**Additional mandatory costs:**
• Healthcare surcharge: £1,035 per year
• Biometric appointment: ~£19.20

**For dependants:**
• Each dependant pays same fees: £766
• Plus healthcare surcharge for each

**Total for main applicant (1 year):**
£766 + £1,035 = £1,801

Would you like details about payment timelines or fee waivers?`;

        } else if (query.includes('process') || query.includes('steps') || query.includes('how')) {
            response = `**Tech Nation Application Process:**

**Stage 1: Tech Nation Endorsement**
1. Prepare evidence portfolio (2-6 months)
2. Get 3 recommendation letters
3. Submit application online (£561)
4. Wait for decision (8-12 weeks)

**Stage 2: Home Office Visa Application**
1. Submit visa application (£205)
2. Book biometric appointment
3. Wait for decision (3-8 weeks)

**Key Timeline:**
• Total process: 4-8 months
• Evidence preparation: Most time-consuming part
• You can pay for priority service to speed up decisions

**Next steps:** Would you like help with evidence requirements or eligibility criteria?`;

        } else if (query.includes('evidence') || query.includes('document')) {
            response = `**Evidence Requirements for Tech Nation:**

**Mandatory for all applicants:**
• CV highlighting digital technology achievements
• Personal statement (1,000 words max)
• 3 recommendation letters from industry leaders

**Optional criteria (need 2 out of 4):**
1. **Recognition outside occupation** - Media coverage, speaking at conferences, awards
2. **Technical expertise** - Open source contributions, patents, peer recognition
3. **Academic/commercial success** - Published research, product launches with metrics
4. **Innovation leadership** - Leading new technologies, digital transformation

**Evidence tips:**
• Maximum 10 pieces of evidence
• Focus on external recognition
• Include quantifiable impact
• Recent evidence preferred (last 5 years)

Which criteria do you think you're strongest in?`;

        } else if (query.includes('eligib') || query.includes('qualify') || query.includes('requirements')) {
            response = `**Tech Nation Eligibility Requirements:**

**Basic requirements:**
• At least 5 years experience in digital technology
• Work must be IN digital technology (not just using it)
• Demonstrate exceptional talent OR exceptional promise

**Two routes available:**

**Exceptional Talent** (established leaders):
• Recognized as leading talent in last 5 years
• Evidence of sustained achievements
• Strong track record of impact

**Exceptional Promise** (emerging leaders):
• Recognized potential to be leading talent
• At early stage of career
• Evidence of emerging expertise

**Common qualifying roles:**
• Senior software engineers/developers
• CTOs, VP Engineering
• Data scientists, AI/ML experts
• Cybersecurity experts
• Digital product managers
• Tech startup founders

Do you have 5+ years in digital technology? Which route seems more applicable to you?`;

        } else if (query.includes('timeline') || query.includes('time') || query.includes('long')) {
            response = `**Tech Nation Application Timeline:**

**Preparation phase: 2-6 months**
• Gathering evidence
• Getting recommendation letters
• Writing personal statement

**Tech Nation review: 8-12 weeks**
• Standard processing time
• Priority service available (extra cost)

**Home Office visa: 3-8 weeks**
• 3 weeks if applying from outside UK
• 8 weeks if applying from inside UK
• Priority services available

**Total timeline: 4-8 months**

**Tips to speed up:**
• Start evidence gathering early
• Use priority services if urgent
• Ensure all documents are complete

**Current stage:** Are you just starting research or ready to begin preparing evidence?`;

        } else if (query.includes('recommend') || query.includes('letter') || query.includes('reference')) {
            response = `**Recommendation Letters for Tech Nation:**

**Requirements:**
• Exactly 3 letters required
• From established leaders in digital technology
• Written specifically for your application
• Must demonstrate knowledge of your work

**Good recommenders:**
• Senior executives at tech companies
• Recognized experts in your field
• Published researchers in digital technology
• Award-winning professionals
• Well-known entrepreneurs

**What letters should include:**
• How they know you and your work
• Your specific achievements and impact
• Why you qualify as exceptional talent/promise
• Their own credentials and expertise

**Red flags to avoid:**
• Generic letters
• Recommenders from outside tech
• People who don't know your work well
• Missing contact information

Do you have potential recommenders in mind? Would you like help identifying suitable people?`;

        } else {
            // Default response
            response = `I can help you with the UK Global Talent Visa Tech Nation application process!

**I can answer questions about:**

• **Costs and fees** - Total expenses and payment timeline
• **Application process** - Step-by-step guidance
• **Evidence requirements** - What documentation you need
• **Eligibility criteria** - Who qualifies for the visa
• **Timeline expectations** - How long each stage takes
• **Recommendation letters** - Getting strong endorsements

**Quick questions to get started:**
• "What are the costs?"
• "How does the process work?"
• "What evidence do I need?"
• "Am I eligible?"

What specific aspect would you like to know about?`;
        }

        return res.status(200).json({ response });

    } catch (error) {
        console.error('Chat API Error:', error);
        return res.status(200).json({ 
            response: 'I encountered an error processing your request. Please try asking about costs, process, evidence, eligibility, or timeline.'
        });
    }
}