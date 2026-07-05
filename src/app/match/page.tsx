"use client";
import { useEffect, useState } from 'react';

export default function MatchPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/get-suggestions')
      .then(r => r.json())
      .then(d => {
        setSuggestions(d.suggestions);
        setLoading(false);
      });
  }, []);

  const approve = async (sug: any) => {
    setSuggestions(prev => prev.filter(s => s.oil2026_slug !== sug.oil2026_slug));
    await fetch('/api/apply-suggestion', {
      method: 'POST',
      body: JSON.stringify(sug),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const reject = async (sug: any) => {
    setSuggestions(prev => prev.filter(s => s.oil2026_slug !== sug.oil2026_slug));
    await fetch('/api/reject-suggestion', {
      method: 'POST',
      body: JSON.stringify({ oil2026_slug: sug.oil2026_slug }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  if (loading) return <div className="p-8">Loading suggestions...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-olive-900 mb-2">Image Matcher Tool</h1>
        <p className="text-gray-600">
          Found {suggestions.length} potential matches for 2026 oils based on 2025 images with similar names.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {suggestions.map(sug => (
          <div key={sug.oil2026_slug} className="border border-gray-200 rounded-lg p-4 flex flex-col items-center bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="relative w-full aspect-[3/4] mb-4 bg-gray-50 rounded overflow-hidden">
              <img src={sug.image} alt={sug.oil2025_name} className="object-contain w-full h-full" />
            </div>
            
            <div className="w-full text-center mb-6 space-y-3 text-sm">
              <div>
                <span className="block text-xs uppercase tracking-wider font-semibold text-olive-600 mb-1">Missing Image for (2026)</span>
                <span className="font-medium text-gray-900">{sug.oil2026_name}</span>
              </div>
              
              <div>
                <span className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Suggested Image from (2025)</span>
                <span className="text-gray-700">{sug.oil2025_name}</span>
              </div>
              
              <div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600 font-medium">
                Similarity: {Math.round(sug.score * 100)}%
              </div>
            </div>

            <div className="flex gap-3 w-full mt-auto">
              <button 
                onClick={() => reject(sug)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                Skip
              </button>
              <button 
                onClick={() => approve(sug)}
                className="flex-1 bg-olive-600 text-white px-3 py-2 rounded-md hover:bg-olive-700 transition-colors font-medium shadow-sm"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {suggestions.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No suggestions left! All done.
        </div>
      )}
    </div>
  );
}
