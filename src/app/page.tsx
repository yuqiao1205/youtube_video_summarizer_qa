'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play, MessageSquare, Loader2, Youtube, Download, Copy, Check } from 'lucide-react';
import { getTranscript } from '../lib/transcript';
import { summarizeTranscript } from '../lib/summarize';
import { answerQuestion } from '../lib/qa';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('english');
  const [model, setModel] = useState('amazon/nova-2-lite-v1:free');
  const [copied, setCopied] = useState(false);

  const modelDisplayNames: { [key: string]: string } = {
    'amazon/nova-2-lite-v1:free': 'Amazon Nova Lite',
    'arcee-ai/trinity-mini:free': 'Arcee Trinity Mini',
    'kwaipilot/kat-coder-pro:free': 'Kat Coder Pro',
  };

  const handleSummarize = async () => {
    if (!url) {
      setError('Please enter a YouTube URL');
      return;
    }
    setError('');
    setLoadingSummary(true);
    try {
      const transcript = await getTranscript(url);
      const sum = await summarizeTranscript(transcript, language, model);
      setSummary(sum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!url || !question) {
      setError('Please enter a YouTube URL and question');
      return;
    }
    setError('');
    setLoadingAnswer(true);
    try {
      const transcript = await getTranscript(url);
      const ans = await answerQuestion(transcript, question, model);
      setAnswer(ans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleDownloadSummary = () => {
    if (!summary) return;
    
    // Remove HTML formatting for plain text
    const plainText = summary
      .replace(/<strong[^>]*>/g, '')
      .replace(/<\/strong>/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1');
    
    // Create blob with text content
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `youtube-summary-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    if (!summary) return;
    
    // Remove HTML formatting for plain text
    const plainText = summary
      .replace(/<strong[^>]*>/g, '')
      .replace(/<\/strong>/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1');
    
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle video URL from search results
  useEffect(() => {
    const videoUrl = searchParams.get('video');
    if (videoUrl) {
      setUrl(decodeURIComponent(videoUrl));
      // Scroll to the URL input
      setTimeout(() => {
        document.getElementById('url')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <header className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Youtube className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 flex-shrink-0" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Lauren's YouTube Video Summarizer & Q&A
              </h1>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="model" className="text-sm font-medium whitespace-nowrap">Model:</label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="flex-1 sm:flex-none bg-white/20 border border-white/30 rounded-lg text-white px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] sm:min-h-0"
              >
                <option value="amazon/nova-2-lite-v1:free" className="bg-slate-800">Amazon Nova Lite</option>
                <option value="arcee-ai/trinity-mini:free" className="bg-slate-800">Arcee Trinity Mini</option>
                <option value="kwaipilot/kat-coder-pro:free" className="bg-slate-800">Kat Coder Pro</option>
              </select>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <SearchBar />

          {/* OR Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-gray-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* URL Input Section */}
          <div className="bg-white backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-2xl border border-gray-200">
            <label htmlFor="url" className="block text-lg font-semibold mb-3 text-gray-800">
              Input YouTube Video URL Here:
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-3 bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1 text-yellow-800">Important: Video Must Have Transcript</p>
                <p>This tool only works with YouTube videos that have <span className="font-semibold text-gray-900">subtitles/transcripts enabled</span>. Please ensure the video you're using has captions available.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Summary Section */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-blue-900">Video Summary</h2>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-blue-800">Summary Language</label>
                <div className="flex gap-4 text-blue-900">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="english"
                      checked={language === 'english'}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="mr-2"
                    />
                    English
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="chinese"
                      checked={language === 'chinese'}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="mr-2"
                    />
                    Chinese
                  </label>
                </div>
              </div>
              <button
                onClick={handleSummarize}
                disabled={loadingSummary}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mb-4 min-h-[44px]"
              >
                {loadingSummary ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  'Summarize Video'
                )}
              </button>
              {summary && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={handleCopySummary}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadSummary}
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download.txt
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-3 sm:p-4 h-[400px] sm:h-[500px] lg:h-[600px] overflow-y-auto border border-blue-200">
                    <div
                      className="text-gray-700 leading-relaxed whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-900">$1</strong>')
                      }}
                    />
                    <p className="text-sm text-blue-600 mt-2">Generated by: {modelDisplayNames[model]}</p>
                  </div>
                </>
              )}
            </div>

            {/* Q&A Section */}
            <div className="md:col-span-1 bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold">Ask Questions About the Video</h2>
              </div>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the video..."
                rows={3}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4 resize-none"
              />
              <button
                onClick={handleAskQuestion}
                disabled={loadingAnswer}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mb-4 min-h-[44px]"
              >
                {loadingAnswer ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Getting Answer...
                  </>
                ) : (
                  'Ask Question'
                )}
              </button>
              {answer && (
                <div className="bg-white/5 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="text-gray-200 leading-relaxed">{answer}</p>
                  <p className="text-sm text-gray-400 mt-2">Generated by: {modelDisplayNames[model]}</p>
                </div>
              )}
            </div>
          </div>
  
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 mt-16 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">How to summarize a YouTube video?</h2>
            <p className="text-xl mb-8 text-gray-300">With 3 simple steps use AI to summarize YouTube videos.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                <div className="text-4xl font-bold text-blue-300 mb-2">1</div>
                <h3 className="text-lg font-semibold mb-2 text-white">Copy YouTube Video URL</h3>
                <p className="text-gray-200">Copy and paste the YouTube Video URL into Lauren's AI YouTube Summarizer.</p>
              </div>
              <div className="bg-gradient-to-br from-green-900/60 to-teal-900/60 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                <div className="text-4xl font-bold text-green-300 mb-2">2</div>
                <h3 className="text-lg font-semibold mb-2 text-white">Generate the Summary</h3>
                <p className="text-gray-200">Click the "Summarize video" button, and Lauren's AI will summarize the YouTube video.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                <div className="text-4xl font-bold text-purple-300 mb-2">3</div>
                <h3 className="text-lg font-semibold mb-2 text-white">View the summary</h3>
                <p className="text-gray-200">Instantly view the AI Generated YouTube video summary, without entering your email or credit card.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-gradient-to-br from-indigo-900/60 to-blue-900/60 backdrop-blur-lg rounded-2xl p-6 shadow-2xl text-center">
                <Copy className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2 text-white">Copy Summary</h3>
                <p className="text-gray-200">Easily copy the generated summary to your clipboard with one click.</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-900/60 to-teal-900/60 backdrop-blur-lg rounded-2xl p-6 shadow-2xl text-center">
                <Download className="w-8 h-8 text-cyan-300 mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2 text-white">Download as TXT</h3>
                <p className="text-gray-200">Download your summary as a text file for offline access anytime.</p>
              </div>
              <div className="bg-gradient-to-br from-violet-900/60 to-purple-900/60 backdrop-blur-lg rounded-2xl p-6 shadow-2xl text-center">
                <MessageSquare className="w-8 h-8 text-purple-300 mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2 text-white">Select Language</h3>
                <p className="text-gray-200">Choose your preferred language for video summaries.</p>
              </div>
              <div className="bg-gradient-to-br from-red-900/60 to-orange-900/60 backdrop-blur-lg rounded-2xl p-6 shadow-2xl text-center">
                <MessageSquare className="w-8 h-8 text-orange-300 mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2 text-white">Ask Questions</h3>
                <p className="text-gray-200">Ask questions about the video content for detailed answers.</p>
              </div>
            </div>
          </div>
  
          <footer className="mt-12 py-12 bg-gradient-to-r from-slate-800 to-purple-800 border-t border-white/20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-blue-400">Lauren's YouTube Summarizer</h3>
                  <p className="text-gray-300">AI-powered tool to summarize YouTube videos and answer questions instantly.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-400">Features</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>Video Summarization</li>
                    <li>Q&A System</li>
                    <li>Multi-language Support</li>
                    <li>Copy Summary</li>
                    <li>Download as TXT</li>
                    <li>Free to Use</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-purple-400">Links</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-white">Contact</a></li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
                <p>&copy; 2025 Lauren's YouTube Video Summarizer. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
