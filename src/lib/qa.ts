'use server';

import OpenAI from "openai";

const DEFAULT_MODEL = 'mistralai/devstral-2512:free';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const QA_SYSTEM_PROMPT = `You are an expert assistant providing detailed and accurate answers based on the following video content. Your responses should be:
1. Precise and free from repetition
2. Consistent with the information provided in the video
3. Well-organized and easy to understand
4. Focused on addressing the user's question directly
If you encounter conflicting information in the video content, use your best judgment to provide the most likely correct answer based on context.
Note: In the transcript, "Text" refers to the spoken words in the video, and "start" indicates the timestamp when that part begins in the video.`;

const QA_USER_PROMPT = `Relevant Video Context: {context}
Based on the above context, please answer the following question:
{question}`;

export async function answerQuestion(
  transcript: string,
  question: string,
  model: string = DEFAULT_MODEL,
): Promise<string> {
  if (!transcript || !question) {
    throw new Error('Transcript and question are required');
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  // Use full transcript as context (simplified, without FAISS for now)
  const context = transcript;

  // Generate answer
  const userPrompt = QA_USER_PROMPT.replace('{context}', context).replace('{question}', question);

  let response;
  try {
    response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: QA_SYSTEM_PROMPT },
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

  const answer = response.choices[0]?.message?.content || 'No answer generated';

  return answer;
}
