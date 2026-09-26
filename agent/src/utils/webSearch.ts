
//search the internet tool

import { env } from "../shared/env";
import { WebSearchResultsSchema } from "./schema";

export async function webSearch(query: string): Promise<string> {
    if(query.trim() === "") {
        throw new Error("Query cannot be empty");
    }

    if (!env.TAVILY_API_KEY) {
        throw new Error("Tavily API key is not set in the environment variables.");
    }   
    const response = await fetch(`https://api.tavily.com/search`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.TAVILY_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            search_depth: "basic",
            max_results: 5,
            include_answers: false,
            include_images: false,
        })
    })

        if(!response.ok) {
            //production lesson
            const text = await safeText(response);
            throw new Error(`Web search failed: ${response.statusText}`);
        }
        
    const data = await response.json();
    
    const results = Array.isArray(data?.results) ? data.results : [];

    const normalizedResults = results.slice(0, 5).map((result: any) => WebSearchResultsSchema.parse({
        title: String(result.title || ""),
        url: String(result.url || ""),
        snippet: String(result.content || "").trim().substring(0, 200), // Limit snippet to 200 characters
    }));

    return JSON.stringify(normalizedResults);

}

async function safeText(response: Response): Promise<string> {
    try {
        return await response.json();
    } catch (error) {
        return "Unable to retrieve response text.";
    }
}

