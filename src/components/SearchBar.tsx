'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl border border-teal-500/30">
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-6 h-6 text-teal-400" />
        <h2 className="text-xl font-bold text-white">Search Youtube Videos only with Transcripts/Captions Available</h2>
      </div>
      {/* <p className="text-sm text-gray-600 mb-4">
        Search for YouTube videos that have transcripts/captions available.
      </p> */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for videos... (e.g., 'nextjs tutorial in minutes')"
          className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!searchQuery.trim()}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap shadow-lg"
        >
          <Search className="w-5 h-5" />
          Search
        </button>
      </form>
    </div>
  );
}