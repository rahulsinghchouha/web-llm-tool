import { z } from "zod";


export const WebSearchResultsSchema = z.object({
            title: z.string().min(1),
            link: z.url(),
            snippet: z.string().optional().default(""),
});

export const WebResultsSchema = z.array(WebSearchResultsSchema).max(10);

export type WebSearchResult = z.infer<typeof WebResultsSchema>;