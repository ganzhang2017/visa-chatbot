// guide_content.js

import * as cheerio from 'cheerio';

const NOTION_PAGE_URL = "https://technation-globaltalentvisa-guide.notion.site/";

export async function getNotionPageContent() {
    try {
        const response = await fetch(NOTION_PAGE_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch Notion page: ${response.statusText}`);
        }
        const html = await response.text();
        
        const $ = cheerio.load(html);
        
        // This selector targets the main content block of the Notion page
        const content = $('[data-block-id]').text();

        if (!content) {
            throw new Error("Could not find any text content on the Notion page.");
        }
        
        console.log("Successfully scraped Notion page.");
        return content;
    } catch (error) {
        console.error('Scraping Error:', error);
        // Returning an empty string prevents the TypeError crash in chat.js
        return ""; 
    }
}
