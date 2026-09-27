import {SummarizeInputSchema, SummarizeOutputSchema} from "./schema";
import {getModel } from "../shared/models";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function summarize(text: string){

    const {text : raw} = SummarizeInputSchema.parse({text});

    const clipped = clip(raw, 4000)

    const model = getModel({temperature: 0.2});

    //ask the model to summarize the text
    const response = await model.invoke([
     new SystemMessage(["You are a helpful assistant that summarizes text. Please provide a concise summary of the following text:\n\n" + 
        "Guidelines for summarization:\n" +
        "- Focus on the main points and key information.\n" +
        "- Avoid unnecessary details or examples.\n" +
        "- Keep the summary clear and easy to understand.\n" +
        "avoid marketing language, and be objective.\n" 
    ].join("\n")),

    new HumanMessage([
        "Summarize the following content for a beginner-friendly audience:",
        "focus on the main points and key information, avoid unnecessary details or examples, keep the summary clear and easy to understand, avoid marketing language, and be objective.",
        "Content to summarize:\n\n" + clipped
    ].join("\n"))
    ])

    const rawModelOutput = typeof response.content === "string" ? response.content : String(response.content);


    return SummarizeOutputSchema.parse({rawModelOutput});
}

function clip(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }   
    else{
        return text.slice(0,maxLength);
    }
}




