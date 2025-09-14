// api/guide_content.js

import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js';

// Cache the content to avoid re-parsing the PDF on every request
let cachedContent = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getNotionPageContent() {
    try {
        // Check if we have cached content that's still fresh
        if (cachedContent && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            console.log("Using cached PDF content");
            return cachedContent;
        }

        // Try to find the PDF file in multiple possible locations
        const possiblePaths = [
            path.join(process.cwd(), 'assets', 'guide.pdf'),
            path.join(process.cwd(), 'public', 'assets', 'guide.pdf'),
            path.join(process.cwd(), 'public', 'guide.pdf'),
            path.join(__dirname, '..', 'assets', 'guide.pdf'),
        ];

        let filePath = null;
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                filePath = possiblePath;
                console.log(`Found PDF at: ${filePath}`);
                break;
            }
        }

        if (!filePath) {
            console.error('PDF guide file not found in any expected location:', possiblePaths);
            return getFallbackContent();
        }

        // Read and parse the PDF
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);

        if (!data.text || data.text.trim().length < 100) {
            throw new Error("Could not extract sufficient text from the PDF file.");
        }

        // Cache the content
        cachedContent = data.text;
        cacheTimestamp = Date.now();

        console.log(`Successfully loaded content from PDF: ${data.text.length} characters, ${data.numpages} pages`);
        return data.text;

    } catch (error) {
        console.error('PDF Parsing Error:', error.message);
        
        // Return cached content if available, even if stale
        if (cachedContent) {
            console.log("Using stale cached content due to error");
            return cachedContent;
        }
        
        // Return fallback content as last resort
        return getFallbackContent();
    }
}

// Fallback content when PDF is not available
function getFallbackContent() {
    console.log("Using fallback content - PDF not available");
    
    return `
UK GLOBAL TALENT VISA GUIDE

ELIGIBILITY REQUIREMENTS

The UK Global Talent visa is for individuals who are leaders or potential leaders in the fields of:
- Science, engineering, medicine
- Digital technology  
- Arts and culture
- Research and academia

You need to be endorsed by one of the following bodies:
- Tech Nation (for digital technology)
- The Royal Society (for science and medicine)
- Royal Academy of Engineering (for engineering)
- The British Academy (for humanities and social sciences)
- Arts Council England (for arts and culture)
- Academy of Medical Sciences (for medical sciences)

ROUTES

Exceptional Talent Route:
- For established leaders in their field
- Must demonstrate exceptional talent
- Significant recognition and achievements required

Exceptional Promise Route:  
- For emerging leaders showing exceptional promise
- Earlier career stage accepted
- Must show potential for leadership

APPLICATION PROCESS

1. Get endorsed by the relevant endorsing body
2. Apply for the visa once endorsed
3. Provide supporting documents
4. Attend biometric appointment
5. Wait for decision

COSTS

- Endorsement fee: £524-£1,096 (varies by body)
- Visa application fee: £623
- Immigration Health Surcharge: £624 per year
- Priority service: additional £500-£1,000

TIMELINE

- Endorsement decision: 8-12 weeks
- Visa decision: 3-8 weeks  
- Fast track available for additional fee

REQUIRED DOCUMENTS

- Valid passport
- Endorsement letter
- Evidence of exceptional talent/promise
- CV and portfolio
- Letters of recommendation  
- English language test (if required)
- TB test results (from some countries)
- Financial evidence

The visa allows you to:
- Live and work in the UK for up to 5 years
- Bring family members
- Apply for settlement after 3-5 years
- Start your own business
- Change jobs freely
`;
}

// Function to manually refresh cache (useful for updates)
export function clearCache() {
    cachedContent = null;
    cacheTimestamp = null;
    console.log("PDF content cache cleared");
}

// Export cache status for debugging
export function getCacheStatus() {
    return {
        hasCachedContent: !!cachedContent,
        cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
        cacheSize: cachedContent ? cachedContent.length : 0
    };
}