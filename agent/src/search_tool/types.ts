

//2
// web path -> browser - summarize - source url
//direct path llm
//shared shape

export type candidate = {
    answer: string;
    sources: string[]; //array of urls
    mode: 'web' | 'direct';
}

