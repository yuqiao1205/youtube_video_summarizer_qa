'use server';

import { fetchTranscript } from 'youtube-transcript-plus';


// https://www.youtube.com/watch?v=iO844izo9kw
function getVideoId(url: string): string | null {
  const pattern = /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

export async function getTranscript(url: string): Promise<string> {
  if (!url) {
    throw new Error('URL is required');
  }

  const videoId = getVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  const transcript = await fetchTranscript(videoId);
  console.log("transcript", transcript);
  if (!transcript || transcript.length === 0) {
    throw new Error('No transcript available');
  }

  // Process transcript to extract only text
  const processedTranscript = transcript.map(item => item.text).join('\n');
  console.log("processedTranscript!!!!", processedTranscript[2]);


  return processedTranscript;
}