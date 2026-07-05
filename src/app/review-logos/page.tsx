"use client";
import { useEffect, useState } from 'react';

export default function ReviewLogosPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recent-logos')
      .then(r => r.json())
      .then(d => {
        setImages(d.images);
        setLoading(false);
      });
  }, []);

  const deleteImage = async (filename: string) => {
    setImages(images.filter(img => img !== filename));
    await fetch('/api/delete-logo', {
      method: 'POST',
      body: JSON.stringify({ filename }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  if (loading) return <div className="p-8">Loading logos...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-olive-900 mb-2">Producer Logos Review Tool</h1>
        <p className="text-gray-600">
          Showing {images.length} logos added in the last 24 hours. Click "Delete" on any image that is incorrect.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {images.map(img => (
          <div key={img} className="border border-gray-200 rounded-lg p-3 flex flex-col items-center bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="relative w-full aspect-square mb-3 bg-gray-50 rounded-full overflow-hidden border border-gray-200 p-2">
              <img 
                src={`/images/producers/${img}`} 
                alt={img} 
                className="object-contain w-full h-full rounded-full"
              />
            </div>
            <p className="text-xs truncate w-full text-center mb-3 text-gray-500" title={img}>
              {img.replace('-logo.png', '')}
            </p>
            <button 
              onClick={() => deleteImage(img)}
              className="w-full bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white transition-colors text-sm font-medium"
            >
              Delete Logo
            </button>
          </div>
        ))}
      </div>
      
      {images.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No recent logos found.
        </div>
      )}
    </div>
  );
}
