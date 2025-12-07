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
  const yt = await Innertube.create();
  const videoId = getVideoId(url);
  
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  const info = await yt.getInfo(videoId);
  
  if (!info.captions) {
    throw new Error('No captions available');
  }
  
  const transcriptData = await info.getTranscript();
  
  if (!transcriptData?.transcript?.content?.body?.initial_segments) {
    throw new Error('Could not fetch transcript');
  }
  
  const segments = transcriptData.transcript.content.body.initial_segments;
  
  return segments
    .map((segment: any) => {
      const runs = segment?.snippet?.runs;
      if (!runs || !Array.isArray(runs) || runs.length === 0) {
        return '';
      }
      return runs.map((run: any) => run.text || '').join('');
    })
    .filter((text: string) => text.length > 0)
    .join('\n');
}