'use server';

import { Innertube } from 'youtubei.js';

function getVideoId(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v') || '';
  } catch {
    return '';
  }
}

export async function getTranscript(url: string): Promise<string> {
  try {
    const yt = await Innertube.create({
      cache: undefined,
      generate_session_locally: true
    });
    const videoId = getVideoId(url);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    const info = await yt.getInfo(videoId);
    
    // Check if captions exist
    const captionTracks = info.captions?.caption_tracks;
    if (!captionTracks || captionTracks.length === 0) {
      throw new Error('No captions available');
    }
    
    // Get the first caption track (usually English or auto-generated)
    const captionTrack = captionTracks[0];
    
    // Fetch the transcript from the caption URL
    const captionUrl = captionTrack.base_url;
    if (!captionUrl) {
      throw new Error('No caption URL found');
    }
    
    const response = await fetch(captionUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch captions: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    
    // Parse XML to extract text
    const textMatches = xmlText.match(/<text[^>]*>([^<]+)<\/text>/g) || [];
    const transcript = textMatches
      .map(match => {
        const text = match.replace(/<text[^>]*>/, '').replace(/<\/text>/, '');
        // Decode HTML entities
        return text
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ');
      })
      .join('\n');
    
    if (!transcript) {
      throw new Error('No transcript text found');
    }
    
    return transcript;
  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    throw new Error(`Failed to fetch transcript: ${error.message}`);
  }
}