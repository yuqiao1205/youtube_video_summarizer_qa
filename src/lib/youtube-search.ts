'use server';

const YT_API = "https://www.googleapis.com/youtube/v3";

export interface VideoResult {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
}

export async function searchVideosWithCaptions(query: string): Promise<VideoResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing YOUTUBE_API_KEY environment variable");
  }

  if (!query || query.trim().length === 0) {
    throw new Error("Search query is required");
  }

  try {
    // Step 1: Search for videos based on keywords
    const searchUrl = `${YT_API}/search?part=snippet&type=video&q=${encodeURIComponent(
      query
    )}&maxResults=10&key=${apiKey}`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      throw new Error(`YouTube API error: ${searchRes.status}`);
    }
    
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");

    // Step 2: Check which videos have captions
    const detailsUrl = `${YT_API}/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    
    if (!detailsRes.ok) {
      throw new Error(`YouTube API error: ${detailsRes.status}`);
    }
    
    const detailsData = await detailsRes.json();

    const results: VideoResult[] = [];

    detailsData.items.forEach((item: any) => {
      const caption = item.contentDetails.caption; // "true" or "false"

      if (caption === "true") {
        const found = searchData.items.find(
          (v: any) => v.id.videoId === item.id
        );
        
        if (found) {
          results.push({
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${item.id}`
          });
        }
      }
    });

    return results.slice(0, 5); // Return top 5 videos with captions
  } catch (error: any) {
    console.error('Error searching YouTube videos:', error);
    throw new Error(`Failed to search videos: ${error.message}`);
  }
}