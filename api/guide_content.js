// api/guide_content.js - Improved version with better PDF handling
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache configuration
let cachedContent = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Main function to get PDF content
export async function getNotionPageContent() {
    try {
        // Check if we have cached content that's still fresh
        if (cachedContent && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            console.log("✅ Using cached PDF content");
            return cachedContent;
        }

        console.log("🔍 Looking for PDF guide file...");
        
        // Try to find the PDF file in multiple possible locations
        const possiblePaths = [
            // Most common locations in Vercel deployment
            path.join(process.cwd(), 'assets', 'guide.pdf'),
            path.join(process.cwd(), 'public', 'assets', 'guide.pdf'),
            path.join(process.cwd(), 'public', 'guide.pdf'),
            
            // Alternative locations
            path.join(__dirname, '..', 'assets', 'guide.pdf'),
            path.join(__dirname, '..', '..', 'assets', 'guide.pdf'),
            path.join(__dirname, '..', '..', 'public', 'assets', 'guide.pdf'),
            path.join(__dirname, '..', '..', 'public', 'guide.pdf'),
            
            // Root level locations
            path.join(process.cwd(), 'guide.pdf'),
            './assets/guide.pdf',
            './public/assets/guide.pdf',
            './guide.pdf'
        ];

        let filePath = null;
        let foundPath = null;
        
        for (const possiblePath of possiblePaths) {
            try {
                if (fs.existsSync(possiblePath)) {
                    const stats = fs.statSync(possiblePath);
                    if (stats.isFile() && stats.size > 1000) { // Minimum file size check
                        filePath = possiblePath;
                        foundPath = possiblePath;
                        console.log(`✅ Found PDF at: ${filePath} (${stats.size} bytes)`);
                        break;
                    }
                }
            } catch (error) {
                // Skip this path and try next
                continue;
            }
        }

        if (!filePath) {
            console.error('❌ PDF guide file not found in any expected location');
            console.error('Searched paths:', possiblePaths);
            
            // List actual directory contents for debugging
            try {
                const currentDir = process.cwd();
                console.log('Current working directory:', currentDir);
                console.log('Contents of current directory:', fs.readdirSync(currentDir));
                
                if (fs.existsSync(path.join(currentDir, 'assets'))) {
                    console.log('Contents of assets directory:', fs.readdirSync(path.join(currentDir, 'assets')));
                }
                
                if (fs.existsSync(path.join(currentDir, 'public'))) {
                    console.log('Contents of public directory:', fs.readdirSync(path.join(currentDir, 'public')));
                }
            } catch (dirError) {
                console.error('Error listing directories:', dirError);
            }
            
            return getFallbackContent();
        }

        console.log(`📖 Reading and parsing PDF from: ${foundPath}`);
        
        // Read and parse the PDF
        const dataBuffer = fs.readFileSync(filePath);
        console.log(`📄 PDF file size: ${dataBuffer.length} bytes`);
        
        if (dataBuffer.length < 1000) {
            throw new Error("PDF file appears to be too small or corrupted");
        }

        const pdfOptions = {
            // PDF parsing options
            normalizeWhitespace: false,
            disableCombineTextItems: false
        };

        const data = await pdf(dataBuffer, pdfOptions);

        if (!data.text || data.text.trim().length < 100) {
            throw new Error(`Could not extract sufficient text from PDF. Extracted ${data.text ? data.text.length : 0} characters`);
        }

        // Clean up the extracted text
        let cleanedText = data.text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        // Cache the content
        cachedContent = cleanedText;
        cacheTimestamp = Date.now();

        console.log(`✅ Successfully loaded PDF content: ${cleanedText.length} characters, ${data.numpages} pages`);
        console.log(`📑 First 200 characters: ${cleanedText.substring(0, 200)}...`);
        
        return cleanedText;

    } catch (error) {
        console.error('❌ PDF Parsing Error:', error.message);
        console.error('Full error:', error);
        
        // Return cached content if available, even if stale
        if (cachedContent) {
            console.log("⚠️ Using stale cached content due to error");
            return cachedContent;
        }
        
        // Return fallback content as last resort
        console.log("🔄 Using comprehensive fallback content");
        return getFallbackContent();
    }
}

// Enhanced fallback content with more comprehensive information
function getFallbackContent() {
    console.log("📋 Using enhanced fallback content - PDF not available");
    
    return `UK GLOBAL TALENT VISA GUIDE - DIGITAL TECHNOLOGY ROUTE

OVERVIEW
The UK Global Talent visa is designed for individuals who are leaders or potential leaders in digital technology. This route is endorsed by Tech Nation and allows successful applicants to live and work in the UK without employer sponsorship.

ELIGIBILITY REQUIREMENTS

Basic Requirements:
• Must have at least 5 years of experience working in the digital technology sector
• Must be able to demonstrate exceptional talent or exceptional promise in digital technology
• Must provide evidence that shows work is IN digital technology, not just USING digital technology as a tool
• Must meet the mandatory criteria and at least 2 of the 4 optional criteria

ROUTES AVAILABLE

1. Exceptional Talent Route (for established leaders):
An applicant evidencing EXCEPTIONAL TALENT must show they have been recognised as a leading talent in the digital technology sector in the last 5 years.

2. Exceptional Promise Route (for emerging leaders):
An applicant evidencing EXCEPTIONAL PROMISE must show they have been recognised as having potential to be a leading talent in the digital technology field in the last 5 years, and be at an early stage in their career.

MANDATORY CRITERIA (ALL applicants must provide)

1. Valid passport or national identity card
2. A CV highlighting career and achievements in digital technology (maximum 3 pages)
3. Personal statement (maximum 1,000 words) explaining how you meet the criteria
4. Three letters of recommendation from established leaders in the digital technology sector

The personal statement should explain:
• Your work in digital technology
• How you meet the criteria
• Your future plans in the UK

Letters of recommendation must:
• Be from established leaders in digital technology
• Demonstrate knowledge of your work and achievements
• Be written specifically for this application
• Include recommender's credentials and contact information
• Be on official letterhead where possible

OPTIONAL CRITERIA (must meet at least 2 of 4)

Criterion 1: Evidence of recognition for work outside your immediate occupation that has contributed to the advancement of the sector

Examples include:
• Media coverage in major publications about your work
• Speaking at significant conferences as a recognised expert
• Receiving industry awards or honors for digital technology work
• Advisory roles or expert panel positions
• Contribution to important industry initiatives
• Recognition by peers in the form of citations or mentions

Criterion 2: Evidence of genuine expertise in digital technology, demonstrated through professional experience and recognition by expert peers

Examples include:
• Open source contributions with measurable impact (downloads, stars, forks)
• Technical publications in respected venues
• Patents in digital technology
• Recognition by expert peers in your field
• Leading technical innovations or breakthroughs
• Significant contributions to important digital technology projects

Criterion 3: Evidence of academic contributions through research endorsed by expert peers, or demonstrable commercial successes in digital technology

Academic route examples:
• Research publications with citations
• Peer-reviewed academic papers
• Research collaborations with leading institutions
• Academic recognition or awards

Commercial route examples:
• Product launches with quantifiable success metrics
• Revenue growth achievements you led or contributed to
• Successful scaling of digital technology products or services
• Commercial partnerships or deals you facilitated
• Customer growth or retention improvements you achieved

Criterion 4: Evidence of innovation in digital technology that has led to new or significantly improved products, technologies, or methodology

Examples include:
• Development of new technologies or methodologies
• Significant improvements to existing digital technologies
• Leadership in digital transformation initiatives
• Creation of new digital products or services
• Implementation of innovative technical solutions
• Pioneering work in emerging technology areas

EVIDENCE PORTFOLIO GUIDELINES

General Requirements:
• Maximum 10 pieces of evidence across all criteria
• Each piece should be substantial and demonstrate clear impact
• Recent evidence preferred (last 5 years)
• Focus on external recognition and quantifiable achievements
• Quality over quantity - better to have fewer strong pieces than many weak ones

Types of Evidence to Include:
• News articles or media coverage
• Awards or recognition certificates
• Conference speaking materials or invitations
• Open source contribution statistics
• Publication records with citation counts
• Patents or intellectual property documents
• Letters from clients, partners, or industry leaders
• Product launch materials with success metrics
• Revenue or growth data you contributed to
• Industry recognition or rankings

TECHNICAL SKILLS EXAMPLES

Suitable technical roles include:
• DevOps/SysOps engineers
• Principal software engineers/developers
• Data scientists/data engineers
• Artificial Intelligence, Natural Language Processing and Machine Learning experts
• Cybersecurity experts
• Hardware engineers
• Front-end developers (experienced level)
• Operating systems engineers
• Video game developers (experienced level)
• UX/UI designers (experienced level)
• Mobile app developers (experienced level)
• Back-end developers leading development of major new technologies
• CTO or VP engineering experience managing teams at growing digital businesses
• Virtual and augmented reality developers
• Blockchain developers
• Cloud architects
• Full-stack developers with leadership experience

BUSINESS SKILLS EXAMPLES

Suitable business roles include:
• Experience leading substantial VC investment (£25m+ GBP)
• Commercial/business leads (P&L, growth, sales strategy) in digital businesses
• Experience expanding or growing significant product-led digital technology businesses
• Sector-specific experience (FinTech payment infrastructure, EdTech international expansion)
• Solution sales experts
• Product managers (experienced level)
• SaaS or enterprise sales leadership for digital services
• Performance marketing experts for digital businesses
• Senior VC or PE analysts with digital business investment track records
• C-Suite roles (CEO, CMO, CIO) or head of operations for digital businesses

ROLES NOT GENERALLY SUITABLE

The following are typically not considered suitable for the digital technology route:
• Service delivery, process delivery, outsourcing roles
• Consultancy (technical or management), ERP consultancy
• Systems administration and related fields
• Corporate roles or large corporate team management
• Junior investor/analyst roles without senior-level track record
• Work at tech-enabled companies rather than product-led digital technology companies
• Agency, outsourcer, or marketing firm roles (unless specifically digital technology focused)

APPLICATION PROCESS

Stage 1: Tech Nation Endorsement Application
• Cost: £561
• Processing time: 8-12 weeks (standard processing)
• Faster processing available for additional cost
• Online application through Tech Nation portal
• Submit evidence portfolio, CV, personal statement, and recommendation letters

Stage 2: Home Office Visa Application (after endorsement approval)
• Cost: £205
• Processing time: 3 weeks (outside UK), 8 weeks (inside UK)
• Additional documents required
• Biometric appointment necessary
• Healthcare surcharge payment required

COSTS BREAKDOWN

Required Costs:
• Tech Nation endorsement fee: £561
• Home Office visa application fee: £205
• Healthcare surcharge: £1,035 per year of visa validity
• Total for main applicant: £766 + healthcare surcharge

Additional Costs (if applicable):
• Dependants (spouse/partner and children): £766 each + healthcare surcharge
• Priority processing (optional): Additional fees apply
• Biometric appointment fees (varies by location)

TIMELINE EXPECTATIONS

Preparation Phase:
• Evidence gathering and portfolio preparation: 2-6 months
• Securing recommendation letters: 1-2 months
• Application preparation: 2-4 weeks

Processing Phase:
• Tech Nation endorsement decision: 8-12 weeks (standard)
• Home Office visa decision: 3 weeks (outside UK), 8 weeks (inside UK)
• Total process time: 4-7 months from start to visa

VISA BENEFITS

The UK Global Talent visa allows you to:
• Live and work in the UK for up to 5 years
• Bring eligible family members (spouse/partner and children under 18)
• Work for any employer or be self-employed
• Start your own business
• Change jobs freely without notifying authorities
• Leave and re-enter the UK multiple times
• Apply for settlement (indefinite leave to remain) after 3-5 years
• Apply for British citizenship after meeting residence requirements

SETTLEMENT PATHWAY

Exceptional Talent route: Eligible to apply for settlement after 3 years
Exceptional Promise route: Eligible to apply for settlement after 5 years

Settlement requirements:
• Continuous residence in the UK
• No extended absences (generally no more than 180 days per year)
• Continued work in digital technology sector
• English language proficiency
• Life in the UK test (if not previously taken)

IMPORTANT NOTES

Quality over Quantity:
• Focus on demonstrating clear impact and external recognition
• Each piece of evidence should tell part of your story
• Quantifiable achievements are particularly valuable
• External validation carries more weight than internal recognition

Common Mistakes to Avoid:
• Submitting evidence that only shows internal company recognition
• Focusing on job responsibilities rather than achievements and impact
• Including too many similar pieces of evidence
• Not demonstrating work IN digital technology vs. just using technology
• Weak or generic recommendation letters
• Exceeding word limits or evidence piece limits

Success Factors:
• Clear narrative showing progression and impact in digital technology
• Strong external recognition from industry peers
• Quantifiable evidence of contributions to the sector
• Well-written personal statement that ties everything together
• High-quality recommendation letters from respected industry figures
• Recent and relevant evidence (within last 5 years preferred)

NEXT STEPS

1. Review Eligibility: Ensure you meet basic requirements and have 5+ years experience
2. Choose Your Route: Determine whether you're applying for Exceptional Talent or Promise
3. Identify Strong Areas: Review the 4 criteria and identify your 2 strongest areas
4. Gather Evidence: Collect quantifiable evidence showing external recognition
5. Secure Recommenders: Approach established digital technology leaders
6. Prepare Application: Write personal statement and organize evidence portfolio
7. Submit Application: Apply through Tech Nation portal with all required documents

For the most up-to-date information and official guidance, always refer to:
• Tech Nation official website
• UK Government immigration guidance
• OISC-registered immigration advisers for legal advice

This visa route is competitive and requires strong evidence of exceptional ability or promise in digital technology. Successful applicants typically have clear evidence of external recognition and quantifiable impact on the digital technology sector.`;

// Function to manually refresh cache (useful for updates)
export function clearCache() {
    cachedContent = null;
    cacheTimestamp = null;
    console.log("🗑️ PDF content cache cleared");
}

// Export cache status for debugging
export function getCacheStatus() {
    return {
        hasCachedContent: !!cachedContent,
        cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
        cacheSize: cachedContent ? cachedContent.length : 0,
        isStale: cacheTimestamp ? (Date.now() - cacheTimestamp > CACHE_DURATION) : null
    };
}

// Function to validate PDF content
export function validatePDFContent(content) {
    if (!content || typeof content !== 'string') {
        return false;
    }
    
    // Check for minimum length
    if (content.length < 1000) {
        return false;
    }
    
    // Check for key terms that should be in the Tech Nation guide
    const requiredTerms = [
        'tech nation',
        'digital technology',
        'exceptional talent',
        'exceptional promise',
        'global talent visa'
    ];
    
    const contentLower = content.toLowerCase();
    const foundTerms = requiredTerms.filter(term => contentLower.includes(term));
    
    // Should find at least 3 out of 5 key terms
    return foundTerms.length >= 3;
}

// Export for testing
export { getFallbackContent };