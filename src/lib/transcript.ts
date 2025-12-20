'use server';

import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { fetchTranscript, YoutubeTranscriptDisabledError, YoutubeTranscriptNotAvailableError } from 'youtube-transcript-plus';

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

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be short links
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1); // Remove leading slash
    }
    
    // Handle youtube.com links
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function getTranscriptWithLangChain(url: string): Promise<string> {
  try {
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
    console.error('LangChain YoutubeLoader failed:', error);
    throw error;
  }
}

async function getTranscriptWithYoutubeTranscript(url: string): Promise<string> {
  try {
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const transcriptData = await fetchTranscript(videoId, {
      lang: 'en',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    if (!transcriptData || transcriptData.length === 0) {
      throw new Error('No transcript available');
    }

    // Join all transcript text segments
    const transcript = transcriptData.map((item: any) => item.text).join(' ');

    if (!transcript) {
      throw new Error('No transcript text found');
    }

    return transcript;
  } catch (error: any) {
    console.error('youtube-transcript library failed:', error);
    throw error;
  }
}

export async function getTranscript(url: string): Promise<string> {
  if (!url) {
    throw new Error('URL is required');
  }

  // Normalize the URL to standard format
  const normalizedUrl = normalizeYoutubeUrl(url);

  // First attempt: Try LangChain YoutubeLoader
  try {
    console.log('Attempting to fetch transcript with LangChain...');
    const transcript = await getTranscriptWithLangChain(normalizedUrl);
    console.log('Successfully fetched transcript with LangChain');
    return transcript;
  } catch (langChainError: any) {
    console.warn('LangChain YoutubeLoader failed, falling back to youtube-transcript library...');
    
    // Second attempt: Fall back to youtube-transcript library
    try {
      console.log('Attempting to fetch transcript with youtube-transcript...');
      const transcript = await getTranscriptWithYoutubeTranscript(normalizedUrl);
      console.log('Successfully fetched transcript with youtube-transcript');
      return transcript;
    } catch (fallbackError: any) {
      console.error('Both LangChain and youtube-transcript failed:', fallbackError);
      
      // Check for common transcript errors from both libraries
      if (fallbackError instanceof YoutubeTranscriptDisabledError ||
          fallbackError instanceof YoutubeTranscriptNotAvailableError ||
          fallbackError.message?.includes('Transcript panel not found') ||
          fallbackError.message?.includes('no transcript') ||
          fallbackError.message?.includes('Transcript is disabled') ||
          fallbackError.message?.includes('Could not retrieve the transcript')) {
        throw new Error('This video does not have a transcript/subtitles available. Please use a video with transcription enabled.');
      }
      
      throw new Error(`Failed to fetch transcript: ${fallbackError.message}`);
    }
  }
}