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
        <div className="text-gray-400">Loading history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
        <p className="text-red-400 text-sm">Error: {error}</p>
        <button
          onClick={fetchHistory}
          className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (memes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No memes generated yet. Start creating!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Meme History ({memes.length})</h2>
        <button
          onClick={fetchHistory}
          className="px-3 py-1.5 text-sm bg-[#2d2d2d] hover:bg-[#3d3d3d] text-[#10a37f] rounded transition"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {memes.map((meme) => (
          <button
            key={meme.id}
            onClick={() => setSelectedMeme(meme)}
            className="group relative aspect-square bg-[#1a1a1a] border border-[#404040] rounded-lg overflow-hidden hover:border-[#10a37f] transition-all"
          >
            {meme.image_data ? (
              <img
                src={meme.image_data}
                alt={`Meme ${meme.id}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <span className="text-xs font-semibold text-white">
                #{meme.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  meme.mode === 'auto'
                    ? 'bg-purple-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {meme.mode === 'auto' ? 'Auto' : 'Manual'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Modal for viewing meme details */}
      {selectedMeme && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMeme(null)}
        >
          <div
            className="bg-[#1a1a1a] border border-[#404040] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#404040] p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Meme #{selectedMeme.id}</h3>
              <button
                onClick={() => setSelectedMeme(null)}
                className="text-gray-400 hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image */}
              <div className="rounded-lg overflow-hidden border border-[#404040]">
                <img
                  src={selectedMeme.image_data}
                  alt={`Meme ${selectedMeme.id}`}
                  className="w-full"
                />
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded ${
                      selectedMeme.mode === 'auto'
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'bg-blue-600/20 text-blue-300'
                    }`}
                  >
                    {selectedMeme.mode === 'auto' ? 'Auto Mode' : 'Manual Mode'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(selectedMeme.created_at)}
                  </span>
                </div>

                {/* User Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    User Input:
                  </label>
                  <p className="text-sm text-gray-300 bg-[#2d2d2d] p-3 rounded border border-[#404040]">
                    {selectedMeme.user_input}
                  </p>
                </div>

                {/* Generated Prompt */}
                {selectedMeme.generated_prompt && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Generated Prompt:
                    </label>
                    <p className="text-xs text-gray-400 bg-[#2d2d2d] p-3 rounded border border-[#404040] line-clamp-3">
                      {selectedMeme.generated_prompt}
                    </p>
                  </div>
                )}

                {/* Captions */}
                {selectedMeme.metadata && selectedMeme.metadata.captions && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Captions:
                    </label>
                    <div className="space-y-2">
                      {selectedMeme.metadata.captions.map((caption: any, idx: number) => (
                        <div key={idx} className="bg-[#2d2d2d] p-2 rounded border border-[#404040]">
                          <span className="text-xs font-medium text-gray-400">
                            {caption.position}:
                          </span>
                          <p className="text-xs text-gray-300 mt-1">{caption.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#404040]">
                <button
                  onClick={() => downloadMeme(selectedMeme)}
                  className="flex-1 px-4 py-2 bg-[#10a37f] hover:bg-[#0d8966] text-white rounded transition text-sm font-medium"
                >
                  💾 Download
                </button>
                <button
                  onClick={() => setSelectedMeme(null)}
                  className="flex-1 px-4 py-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-300 rounded transition text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
