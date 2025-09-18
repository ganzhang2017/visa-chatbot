// api/guide_content.js

// Cache the content to avoid re-parsing
let cachedContent = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getNotionPageContent() {
    try {
        // Check if we have cached content that's still fresh
        if (cachedContent && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            console.log("Using cached content");
            return cachedContent;
        }

        // For now, return fallback content since PDF parsing is causing issues
        // You can add PDF parsing back later once other issues are resolved
        console.log("Using fallback content");
        cachedContent = getFallbackContent();
        cacheTimestamp = Date.now();
        
        return cachedContent;

    } catch (error) {
        console.error('Content Loading Error:', error.message);
        
        // Return cached content if available, even if stale
        if (cachedContent) {
            console.log("Using stale cached content due to error");
            return cachedContent;
        }
        
        // Return fallback content as last resort
        return getFallbackContent();
    }
}

// Enhanced fallback content with detailed eligibility criteria
function getFallbackContent() {
    console.log("Using fallback content");
    
    return `
UK GLOBAL TALENT VISA GUIDE - DIGITAL TECHNOLOGY ROUTE

ELIGIBILITY REQUIREMENTS

The UK Global Talent visa is for individuals who are leaders or potential leaders in digital technology.

You need to be endorsed by Tech Nation for the digital technology route.

ROUTES

Exceptional Talent Route (leader in relevant field):
An applicant evidencing EXCEPTIONAL TALENT must:
• Show that they have been recognised as a leading talent in the digital technology sector in the last 5 years.

And provide at least 2 pieces of evidence for 2 of the following:
• A proven track record for innovation as a founder or senior executive of a product-led digital technology company or as an employee working on a new digital field or concept
• Proof of recognition for work beyond the applicant's occupation that contributes to the advancement of the field
• They have made significant technical, commercial or entrepreneurial contributions to the field as a founder, senior executive, board member or employee of a product-led digital technology company
• They have demonstrated exceptional ability in the field by academic contributions through research published or endorsed by an expert

Exceptional Promise Route (potential leader in relevant field):
An applicant evidencing EXCEPTIONAL PROMISE must:
• Show they have been recognised as having potential to be a leading talent in the digital technology field in the last 5 years.

And provide at least 2 pieces of evidence for 2 of the following:
• Innovation as a founder of a product led digital technology company or as an employee working on a new digital field or concept
• A proof of recognition for work beyond the applicant's occupation that contributes to the advancement of the field
• They have made significant technical, commercial or entrepreneurial contributions to the field as a founder or employee of a product-led digital technology company
• They have demonstrated exceptional ability in the field by academic contributions through research endorsed by an expert

And:
• Be at an early stage in their career

EXAMPLES OF TECHNICAL SKILLS
• DevOps / SysOps engineers
• Principal software engineers/developers
• Experienced data scientists/data engineers
• Artificial Intelligence, Natural Language Processing and Machine Learning experts (AI, NLP, ML)
• Cybersecurity experts
• Hardware engineers
• Experienced front-end developers
• Operating systems engineers
• Experienced video game developers
• Experienced UX/UI designers
• Experienced Mobile App developers
• Experienced back end developers leading development of, or contributing heavily to major new technologies or open-source projects (e.g. blockchain, Scala, Golang, Elasticsearch etc)
• CTO or VP engineering experience managing teams of in-house employees at a growing digital business
• Virtual and augmented reality developers

EXAMPLES OF BUSINESS SKILLS
• Experience of leading substantial VC investment over £25m GBP
• Experience as a commercial/business lead (P&L, growth, sales and distribution strategy) in a digital business
• Experience of expanding or growing a significant product-led digital technology business
• Sector-specific experience e.g. payment infrastructure in FinTech / international expansion in EdTech etc.
• Solution sales experts
• Experienced Product Manager
• SaaS or enterprise sales leadership for digital services
• Solution sales skills performed for a growing B2B digital business (i.e. not big-company experience)
• Performance marketing experts, performed in house for digital businesses
• Experienced and senior VC or PE analysts with track records of leading investments in digital businesses
• Experience as C Suite in a SMEs + (CEO, CMO, CIO) or head of operations for a digital business

SPECIALISMS NOT GENERALLY CONSIDERED SUITABLE:
• Service Delivery, Process Delivery, Outsourcing, Consultancy (technical or management), ERP Consultancy, Systems Admin and all related fields
• Corporate roles or experience of managing large corporate teams
• Junior investors/analysts. Such specialisms must be supported by an investment track record made at a senior level and are not suitable for Global Promise
• Business skills apply to in-house work within product-led digital technology companies, not tech-enabled or service companies such as agencies, outsourcers, marketing firms etc

MANDATORY CRITERIA

How do I demonstrate that I have been recognised as (or recognised as having the potential to be) a leading talent in the digital technology sector in the last 5 years?

A 'leader' of exceptional talent (or promise) must show extraordinary ability by sustained (or emerging) national or international recognition. The individual will be able to demonstrate a level of expertise (or emerging expertise) which places them at the forefront of their respective field in the digital technology sector.

Examples of relevant evidence could include:
• You led the growth of a product-led digital technology company, product or team inside a digital technology company, as evidenced by reference letter(s) from leading industry expert(s) describing your work, or as evidenced by news clippings, lines of code from public repos or similar evidence
• You led the marketing or business development at a product-led digital technology company, demonstrably enabling substantial revenue and/or customer growth or major commercial success, as evidenced by reference letter(s) from leading industry expert(s) describing your work, senior global commercial executives inside the company and/or at company partners/customers, or similar evidence
• You led the growth of a non-profit organisation or social enterprise with a specific focus on the digital technology sector, as evidenced by reference letter(s) from leading industry expert(s) describing your work, or as evidenced by news clippings or similar evidence
• Outside of your normal day-to-day job role, you led or were a significant contributor to a substantial open source project, as evidenced from compilation of code commit summaries, repo stars or similar metrics such as download statistics, where possible
• Outside of your normal day-to-day job role, you established, led or were a senior contributor to a large technology-led industry initiative, evidenced through reference letter(s) from global senior project executives
• You have received nationally or internationally recognised prizes or awards for excellence specifically in the digital technology sector, as evidenced by the award itself, reference letter(s) from leading industry expert(s) describing your achievement, or as evidenced by news clippings or similar evidence

APPLICATION PROCESS

Stage 1: Tech Nation Endorsement (£561 fee)
Stage 2: Home Office Visa Application (£205 fee + £1,035/year healthcare surcharge)

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
• Tech Nation decision: 8-12 weeks
• Home Office visa decision: 3 weeks (outside UK), 8 weeks (inside UK)
• You may be able to pay to get a faster decision

COSTS
• Tech Nation endorsement: £561
• Visa application: £205
• Healthcare surcharge: £1,035 per year
• If you're including your partner or children in your application, they'll each need to pay £766

The visa allows you to:
• Live and work in the UK for up to 5 years
• Bring family members
• Apply for settlement after 3-5 years
• Start your own business
• Change jobs freely
`;
}

// Function to manually refresh cache (useful for updates)
export function clearCache() {
    cachedContent = null;
    cacheTimestamp = null;
    console.log("Content cache cleared");
}

// Export cache status for debugging
export function getCacheStatus() {
    return {
        hasCachedContent: !!cachedContent,
        cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
        cacheSize: cachedContent ? cachedContent.length : 0
    };
}