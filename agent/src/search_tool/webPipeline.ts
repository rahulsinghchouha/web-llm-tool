
// top 10 engineering colleges in india
//searcht the web
//visist the page 
//summarize the result
//return the candidate answer with source urls

import { RunnableLambda } from "@langchain/core/runnables";
import { webSearch } from "../utils/webSearch";
import { input } from "zod";
import { openUrl } from "../utils/openUrl";
import { summarize } from "../utils/summarize";

const setTopResults = 5;

export const webSearchStep = RunnableLambda.from(
    async( ctx : {q : string, mode : 'web' | 'direct'}) => {
    
        const results = await webSearch(ctx.q);

        return {
            ...input,
            results,
    }
}
)

export const openAndSummarizeStep = RunnableLambda.from(
        async(input: {q: string; mode: 'web' | 'direct', results: any[]}) => {

            if(!Array.isArray(input.results) || input.results.length === 0) {
              return {
                ...input,
                pageSummaries: [],
                fallback: 'no results found',
              }
            }

            const extractTopResult = input.results.slice(0, setTopResults);

            const settledResults = await Promise.allSettled(
                extractTopResult.map(async (result : any) => {
                    const opened = await openUrl(result.url);
                    const summarized = await summarize({ text: opened.content });
                    return {
                        ...result,
                        summary: summarized.summary,
                    };
                }

        }
    )