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
    <div className="bg-white backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Search Youtube Videos only with Transcripts/Captions Available</h2>
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
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!searchQuery.trim()}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-500 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap shadow-md"
        >
          <Search className="w-5 h-5" />
          Search
        </button>
      </form>
    </div>
  );
}