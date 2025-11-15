'use client';

import { useEffect, useState } from 'react';

interface Meme {
  id: number;
  mode: 'auto' | 'manual';
  user_input: string;
  generated_prompt: string;
  image_data: string;
  metadata: any;
  created_at: string;
}

export default function History() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/meme/history?limit=50');
      const data = await response.json();

      if (data.success) {
        setMemes(data.memes);
      } else {
        setError(data.error || 'Failed to load history');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadMeme = (meme: Meme) => {
    const link = document.createElement('a');
    link.href = meme.image_data;
    link.download = `meme-${meme.id}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
        <button
          onClick={fetchHistory}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (memes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No memes generated yet. Start creating!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meme History ({memes.length})</h2>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memes.map((meme) => (
          <div
            key={meme.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => setSelectedMeme(meme)}
          >
            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
              {meme.image_data ? (
                <img
                  src={meme.image_data}
                  alt={`Meme ${meme.id}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400">No image</div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                  meme.mode === 'auto'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {meme.mode === 'auto' ? 'Auto' : 'Manual'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(meme.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                {meme.user_input}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for viewing meme details */}
      {selectedMeme && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMeme(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Meme #{selectedMeme.id}</h3>
                  <span className={`px-3 py-1 text-sm font-semibold rounded ${
                    selectedMeme.mode === 'auto'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedMeme.mode === 'auto' ? 'Auto Mode' : 'Manual Mode'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMeme(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <img
                  src={selectedMeme.image_data}
                  alt={`Meme ${selectedMeme.id}`}
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    User Input:
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                    {selectedMeme.user_input}
                  </p>
                </div>

                {selectedMeme.generated_prompt && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Generated Prompt:
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                      {selectedMeme.generated_prompt}
                    </p>
                  </div>
                )}

                {selectedMeme.metadata && selectedMeme.metadata.captions && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Captions:
                    </label>
                    <div className="space-y-2">
                      {selectedMeme.metadata.captions.map((caption: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                          <span className="font-medium">{caption.position}:</span> {caption.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Created:
                  </label>
                  <p className="text-gray-900">{formatDate(selectedMeme.created_at)}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => downloadMeme(selectedMeme)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setSelectedMeme(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
