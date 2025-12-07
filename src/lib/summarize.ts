'use server';

import OpenAI from "openai";

const MODEL = 'amazon/nova-2-lite-v1:free'; // Grok fast 1

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const SYSTEM_PROMPT_EN = `You are an AI assistant tasked with summarizing YouTube video transcripts. Provide concise, informative summaries that capture the main points of the video content.

Instructions:
1. Summarize the transcript in an ordered list (1., 2., 3., etc.) with clear headings in **bold** where appropriate.
2. Use a new line for each point.
3. Ignore any timestamps in your summary.
4. Focus on the spoken content (Text) of the video.

Note: In the transcript, "Text" refers to the spoken words in the video, and "start" indicates the timestamp when that part begins in the video.`;

const SYSTEM_PROMPT_ZH = `You are an AI assistant tasked with summarizing YouTube video transcripts. Provide concise, informative summaries that capture the main points of the video content in Chinese.

Instructions:
1. Summarize the transcript in an ordered list (1., 2., 3., etc.) with clear headings in **bold** where appropriate in Chinese.
2. Use a new line for each point.
3. Ignore any timestamps in your summary.
4. Focus on the spoken content (Text) of the video.

Note: In the transcript, "Text" refers to the spoken words in the video, and "start" indicates the timestamp when that part begins in the video.`;

const USER_PROMPT = `Please summarize the following YouTube video transcript:

{transcript}`;

export async function summarizeTranscript(transcript: string, language: string = 'english', model: string = 'amazon/nova-2-lite-v1:free'): Promise<string> {
  if (!transcript) {
    throw new Error('Transcript is required');
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const userPrompt = USER_PROMPT.replace('{transcript}', transcript);
  const systemPrompt = language === 'chinese' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;

  let response;
  try {
    response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 900,
    });
  } catch (error: any) {
    if (error.status === 429) {
      throw new Error('Selected model is currently rate limited or unavailable. Please try a different model.');
    }
    throw error;
  }

  const summary = response.choices[0]?.message?.content || 'No summary generated';

  return summary;
}