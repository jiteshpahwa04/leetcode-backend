import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import logger from "../config/logger.config";
import TurndownService from "turndown";

export async function sanitizeMarkdown(markdown: string): Promise<string> {
    if(!markdown || typeof markdown !== 'string') {
        return '';
    }

    try {
        const convertedHTML = await marked.parse(markdown);
        
        const sanitizedHTML = sanitizeHtml(convertedHTML, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'pre', 'code']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                'img': ['src', 'alt', 'title', 'width', 'height'],
                'a': ['href', 'name', 'target'],
                'code': ['class'],
                'pre': ['class']
            },
            allowedSchemes: ['http', 'https'],
            allowedSchemesByTag: {
                'img': ['http', 'https'],
                'a': ['http', 'https']
            }
        });

        const tds = new TurndownService();
        return tds.turndown(sanitizedHTML);
    } catch (error) {
        logger.error("Error sanitizing markdown:", error);
        return '';
    }
}