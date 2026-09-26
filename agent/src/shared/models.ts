import {env} from "./env";
import {ChatOpenAI} from "@langchain/openai";
import {ChatGooglegenerativeai} from "@langchain/google-genai";
import {ChatGroq} from "@langchain/groq";

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

type ModelOpts = {
    temperature?: number;
    maxTokens?: number;
}

export function getModel(Opts: ModelOpts = {}): BaseChatModel {

    const temperature = Opts.temperature ?? 0.2;
    const maxTokens = Opts.maxTokens ?? 1000;

    switch (env.MODEL_PROVIDER) {
        case: "gemini":
            return new ChatGooglegenerativeai({
                model: env.GEMINI_MODEL,
                temperature,
                maxOutputTokens: maxTokens,
                apiKey: env.GOOGLE_API_KEY,
            });
        case: "openai":
            return new ChatOpenAI({
                model: env.OPENAI_MODEL,
                temperature,
                maxTokens,
                openAIApiKey: env.OPENAI_API_KEY,
            });
        case: "groq":
            return new ChatGroq({
                model: env.GROQ_MODEL,
                temperature,
                maxTokens,
                apiKey: env.GROQ_API_KEY,
            });
        default:
            throw new Error(`Unsupported model provider: ${env.MODEL_PROVIDER}`);

    }

}





