'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Youtube, Copy, Check, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { searchVideosWithCaptions, VideoResult } from '@/lib/youtube-search';
import SearchBar from '@/components/SearchBar';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await searchVideosWithCaptions(query);
      setVideos(results);
      
      if (results.length === 0) {
        setError('No videos with transcripts found for your search. Try different keywords.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async (videoId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(videoId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleUseVideo = (url: string) => {
    router.push(`/?video=${encodeURIComponent(url)}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Youtube className="w-10 h-10 text-red-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Search Results with Transcripts
            </h1>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </header>

        {/* Search Bar */}
        <div className="max-w-7xl mx-auto mb-8">
          <SearchBar />
        </div>

        {/* Search Query Display */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-lg">
              <span className="text-gray-400">Searching for:</span>{' '}
              <span className="font-semibold text-blue-300">&quot;{query}&quot;</span>
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400 mb-4" />
            <p className="text-xl text-gray-300">Searching for videos with transcripts...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
              <p className="text-red-300 text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && !error && videos.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-4">
              <p className="text-gray-300">
                Found <span className="font-bold text-green-400">{videos.length}</span> video{videos.length !== 1 ? 's' : ''} with transcripts
              </p>
            </div>

            <div className="space-y-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:border-blue-400/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6 p-6">
                    {/* Thumbnail */}
                    <div className="lg:w-80 flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full rounded-lg object-cover aspect-video"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <h3 className="text-xl lg:text-2xl font-bold mb-3 text-white">
                        {video.title}
                      </h3>
                      
                      <p className="text-sm text-gray-400 mb-3">
                        {video.channelTitle} • {formatDate(video.publishedAt)}
                      </p>
                      
                      <p className="text-gray-300 text-sm lg:text-base mb-6 flex-1 line-clamp-4">
                        {video.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          onClick={() => handleUseVideo(video.url)}
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all flex flex-col items-center justify-center gap-1"
                        >
                          <Youtube className="w-5 h-5" />
                          <span className="text-xs sm:text-sm leading-tight text-center">Use This Video<br />for Summarization</span>
                        </button>
                        
                        <button
                          onClick={() => handleCopyUrl(video.id, video.url)}
                          className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          {copiedId === video.id ? (
                            <>
                              <Check className="w-5 h-5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-5 h-5" />
                              Copy URL
                            </>
                          )}
                        </button>
                        
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-500/80 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Watch
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}