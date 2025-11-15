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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Meme Idea */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Meme Idea <span className="text-red-500">*</span>
        </label>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g., A cat surprised by seeing the Wi-Fi password"
          required
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Captions Section */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Captions (Optional - AI will generate if empty)
        </label>
        <div className="space-y-3">
          {captions.map((caption, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={caption.text}
                onChange={(e) => updateCaption(index, 'text', e.target.value)}
                placeholder={`Caption ${index + 1}`}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select
                value={caption.position}
                onChange={(e) => updateCaption(index, 'position', e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useOverlay}
            onChange={(e) => setUseOverlay(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
          />
          <div className="flex-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Use Programmatic Text Overlay
            </span>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Better text quality but may take slightly longer. Unchecked = AI
              generates all text (faster, may have text quality issues).
            </p>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!idea.trim()}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        ✨ Generate Meme
      </button>

      {/* Example Ideas */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p className="font-semibold">Example ideas:</p>
        <ul className="list-disc list-inside space-y-0.5 pl-2">
          <li>Dog confused by laptop showing code</li>
          <li>Person realizing it's Monday tomorrow</li>
          <li>Cat judging you for eating junk food</li>
        </ul>
      </div>
    </form>
  );
}
