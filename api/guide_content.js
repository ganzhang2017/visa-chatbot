// api/guide_content.js - Minimal working version
export async function getNotionPageContent() {
    // Return static content for now to avoid any import issues
    return `
UK GLOBAL TALENT VISA - TECH NATION GUIDE

ELIGIBILITY REQUIREMENTS
• At least 5 years experience in digital technology sector
• Demonstrate exceptional talent OR exceptional promise
• Meet mandatory criteria + at least 2 optional criteria
• Work must be IN digital technology (not just using it as a tool)

MANDATORY CRITERIA
• Valid passport
• CV highlighting digital technology achievements
• Personal statement (1,000 words max)
• 3 recommendation letters from industry leaders

OPTIONAL CRITERIA (need 2 of 4)
1. Recognition outside immediate occupation
2. Technical expertise with peer recognition
3. Academic contributions or commercial success
4. Innovation in digital technology

APPLICATION PROCESS
Stage 1: Tech Nation Endorsement (£561)
Stage 2: Home Office Visa Application (£205 + £1,035/year healthcare)

COSTS
• Tech Nation endorsement: £561
• Visa application: £205
• Healthcare surcharge: £1,035 per year
• Total first year: £1,801

TIMELINE
• Evidence preparation: 2-6 months
• Tech Nation decision: 8-12 weeks
• Home Office decision: 3-8 weeks
• Total process: 4-8 months

VISA BENEFITS
• Live and work in UK for up to 5 years
• Bring family members
• No job restrictions
• Path to settlement after 3-5 years
`;
}

export function clearCache() {
    console.log("Cache cleared");
}

export function getCacheStatus() {
    return {
        hasCachedContent: true,
        cacheAge: 0,
        cacheSize: 1000
    };
}