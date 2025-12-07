'use server';

import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";

function normalizeYoutubeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be short links
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1); // Remove leading slash
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    
    // Handle youtube.com links - keep only the v parameter
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    // Return original URL if no transformation needed
    return url;
  } catch (error) {
    // If URL parsing fails, return original
    return url;
  }
}

export async function getTranscript(url: string): Promise<string> {
  try {
    if (!url) {
      throw new Error('URL is required');
    }

    // Normalize the URL to standard format
    const normalizedUrl = normalizeYoutubeUrl(url);

    const loader = YoutubeLoader.createFromUrl(normalizedUrl, {
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
    
    // Check for common transcript errors
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('Transcript panel not found') ||
        errorMessage.includes('no transcript') ||
        errorMessage.includes('Transcript is disabled')) {
      throw new Error('This video does not have a transcript/subtitles available. Please use a video with transcription enabled.');
    }
    
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }
}