'use server';

import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";

export async function getTranscript(url: string): Promise<string> {
  try {
    if (!url) {
      throw new Error('URL is required');
    }

    const loader = YoutubeLoader.createFromUrl(url, {
      language: "en",
      addVideoInfo: false,
    });

    const docs = await loader.load();

    if (!docs || docs.length === 0) {
      throw new Error('No transcript available');
    }

    // Extract text content from the documents
    const transcript = docs.map(doc => doc.pageContent).join('\n');

    if (!transcript) {
      throw new Error('No transcript text found');
    }

    return transcript;
  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }
}