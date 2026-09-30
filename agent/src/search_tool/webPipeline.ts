
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
    async (ctx: { q: string, mode: 'web' | 'direct' }) => {

        const results = await webSearch(ctx.q);

        return {
            ...input,
            results,
        }
    }
)

export const openAndSummarizeStep = RunnableLambda.from(
    async (input: { q: string; mode: 'web' | 'direct', results: any[] }) => {

        if (!Array.isArray(input.results) || input.results.length === 0) {
            return {
                ...input,
                pageSummaries: [],
                fallback: 'no results found',
            }
        }

        const extractTopResult = input.results.slice(0, setTopResults);

        const settledResults = await Promise.allSettled(
            extractTopResult.map(async (result: any) => {
                const opened = await openUrl(result.url);
                const summarizeContent = await summarize(opened.content);
                return {
                    url: opened.url,
                    summary: summarizeContent.summary,
                }

            })
        )
        // status -> fulfilled
        const settledResultPageSummarize = settledResults
            .filter((res) => res.status === 'fulfilled')
            .map((res) => (res as PromiseFulfilledResult<any>).value);

        //edge case: allsettled all case failed
        if (settledResultPageSummarize.length === 0) {
            const fallbackSnippet = extractTopResult.map((result: any) => ({
                url: result.url,
                summary: String(result.snippet || result.title || "").trim()
            })).filter((x: any) => x.summary.length > 0)

            return {
                ...input,
                pageSummaries: fallbackSnippet,
                fallback: "No pages could be opened or summarized, using fallback snippets instead.",
            }
        }
        return {
            ...input,
            pageSummaries: settledResultPageSummarize,
            fallback: "Some pages could not be opened or summarized, using fallback snippets for those.",
        }
    }
)

// compose step now
// {q,pageSummaries : [{url, summary}], mode, fallback}

//candidate answer with source urls
