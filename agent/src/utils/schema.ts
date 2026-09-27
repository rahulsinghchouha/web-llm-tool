import { z } from "zod";


export const WebSearchResultsSchema = z.object({
            title: z.string().min(1),
            link: z.url(),
            snippet: z.string().optional().default(""),
});

export const WebResultsSchema = z.array(WebSearchResultsSchema).max(10);

export type WebSearchResult = z.infer<typeof WebResultsSchema>;

export const OpenUrlInputSchema = z.object({ 
    url: z.url(),
});

export const OpenUrlOutputSchema = z.object({ 
    url: z.url(),
    content:z.string().min(1)
});

export const SummarizeInputSchema = z.object({
text: z.string().min(50, "Text must be at least 50 characters long"),
});
export const SummarizeOutputSchema = z.object({
    summary: z.string().min(1, "Summary cannot be empty"),
});

export const SearchInputSchema = z.object({
    q: z.string().min(1, "Query cannot be empty"),
});

export type SearchInput = z.infer<typeof SearchInputSchema>;
