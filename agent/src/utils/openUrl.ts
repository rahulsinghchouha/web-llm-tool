
import {convert} from "html-to-text"
//fetch each and every page
// the llm  can'tdirect browse the web
// code we write act as a browser tool, we decide what content is safe and what we want to model show
// we fetch the url we stripe unnecessary content and return the relevant content to the llm

export async function openUrl(url: string): Promise<string> {
    if(url.trim() === "") {
        throw new Error("URL cannot be empty");
    }

    const normalized = new URL(url);
    //check https
    if(normalized.protocol !== "https:") {
        throw new Error("Only HTTPS URLs are allowed for security reasons.");
    }

    const response = await fetch(normalized.toString(), {
        headers: {
            'User-Agent': 'agent-core/1.0 (+course-demo)',
        }
    });

    if(!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to fetch URL: ${response.statusText} , ${JSON.stringify(body)}`);
    }

    //step - 3

    const contentType = response.headers.get("content-type") ?? "";

    const htmlContent = await response.text();

    const text = contentType.includes("text/html") ? 
    convert(htmlContent, {
        wordwrap: false,
        selectors:



  
    return htmlContent;
}



