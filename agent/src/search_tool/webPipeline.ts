
// top 10 engineering colleges in india
//searcht the web
//visist the page 
//summarize the result
//return the candidate answer with source urls

import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { webSearch } from "../utils/webSearch";
import { input } from "zod";
import { openUrl } from "../utils/openUrl";
import { summarize } from "../utils/summarize";
import { getModel } from "../shared/models";
import { candidate } from "./types";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

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

export const ComposeStep = RunnableLambda.from(
  async (input: {
    q: string;
    pageSummaries: Array<{ url: string; summary: string }>;
    mode: "web" | "direct";
    fallback: "no-results" | "snippets" | "none";
  }): Promise<candidate> => {
    const model = getModel({ temperature: 0.2 });

    if (!input.pageSummaries || input.pageSummaries.length === 0) {
      const directResponseFromModel = await model.invoke([
        new SystemMessage(
          [
            "You answer briefly and clearly for beginners",
            "If unsure, say so",
          ].join("\n")
        ),
        new HumanMessage(input.q),
      ]);

      const directAns = (
        typeof directResponseFromModel.content === "string"
          ? directResponseFromModel.content
          : String(directResponseFromModel.content)
      ).trim();

      return {
        answer: directAns,
        sources: [],
        mode: "direct",
      };
    }

    const res = await model.invoke([
      new SystemMessage(
        [
          "You concisely answer questions using provided page summaries",
          "Rules:",
          "- Be accurate and netral",
          "- 5-8 sentences max",
          "- Use only the provided summaries; do not invent new facts",
        ].join("\n")
      ),
      new HumanMessage(
        [
          `Question: ${input.q}`,
          "Summaries:",
          JSON.stringify(input.pageSummaries, null, 2),
        ].join("\n")
      ),
    ]);

    const finalAns =
      typeof res.content === "string" ? res.content : String(res.content);

    const extractSources = input.pageSummaries.map((x) => x.url);

    return {
      answer: finalAns,
      sources: extractSources,
      mode: "web",
    };
  }
);

// LCEL
//webSearchStep
//openAndSummarizeStep
//stepCompose

export const webPath = RunnableSequence.from([
  webSearchStep,
  openAndSummarizeStep,
  ComposeStep,
]);
