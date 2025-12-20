import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SearchClient from './SearchClient';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 text-gray-900 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
