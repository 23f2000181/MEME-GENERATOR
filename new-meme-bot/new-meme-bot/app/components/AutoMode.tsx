'use client';

import { useState } from 'react';

interface Caption {
  text: string;
  position: 'top' | 'bottom' | 'center';
}

interface AutoModeProps {
  onGenerate: (image: string) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

export default function AutoMode({ onGenerate, onLoading, onError }: AutoModeProps) {
  const [idea, setIdea] = useState('');
  const [captions, setCaptions] = useState<Caption[]>([
    { text: '', position: 'top' },
    { text: '', position: 'bottom' },
    { text: '', position: 'center' },
  ]);
  const [useOverlay, setUseOverlay] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    onLoading(true);

    try {
      // Filter out empty captions
      const validCaptions = captions.filter((cap) => cap.text.trim().length > 0);

      const response = await fetch('/api/meme/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          captions: validCaptions.length > 0 ? validCaptions : undefined,
          useOverlay,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate meme');
      }

      onGenerate(data.image);
    } catch (error: any) {
      console.error('Error generating meme:', error);
      onError(error.message || 'Failed to generate meme. Please try again.');
    } finally {
      onLoading(false);
    }
  };

  const updateCaption = (index: number, field: 'text' | 'position', value: string) => {
    const newCaptions = [...captions];
    newCaptions[index] = { ...newCaptions[index], [field]: value };
    setCaptions(newCaptions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main Input */}
      <div className="flex gap-3">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your meme idea..."
          required
          rows={3}
          className="flex-1 px-4 py-3 bg-[#2d2d2d] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#10a37f] focus:ring-1 focus:ring-[#10a37f] transition-all resize-none"
        />
        <button
          type="submit"
          disabled={!idea.trim()}
          className="px-6 bg-[#10a37f] hover:bg-[#0d8966] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors self-end"
        >
          ✨
        </button>
      </div>

      {/* Advanced Options */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors">
          ⚙️ Advanced Options
        </summary>

        <div className="mt-3 space-y-3 pt-3 border-t border-[#404040]">
          {/* Captions Section */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">
              Captions (Optional)
            </label>
            <div className="space-y-2">
              {captions.map((caption, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={caption.text}
                    onChange={(e) => updateCaption(index, 'text', e.target.value)}
                    placeholder={`Caption ${index + 1}`}
                    className="flex-1 px-3 py-2 bg-[#2d2d2d] border border-[#404040] rounded text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#10a37f]"
                  />
                  <select
                    value={caption.position}
                    onChange={(e) => updateCaption(index, 'position', e.target.value)}
                    className="px-2 py-2 bg-[#2d2d2d] border border-[#404040] rounded text-sm text-gray-300 focus:outline-none focus:border-[#10a37f]"
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Text Overlay Option */}
          <label className="flex items-center gap-3 cursor-pointer p-2 bg-[#2d2d2d] rounded border border-[#404040] hover:border-[#10a37f] transition-colors">
            <input
              type="checkbox"
              checked={useOverlay}
              onChange={(e) => setUseOverlay(e.target.checked)}
              className="w-4 h-4 accent-[#10a37f]"
            />
            <span className="text-sm text-gray-300">Use Text Overlay (better quality)</span>
          </label>
        </div>
      </details>
    </form>
  );
}
