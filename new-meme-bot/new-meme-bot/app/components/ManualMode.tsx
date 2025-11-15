'use client';

import { useState } from 'react';

interface ManualModeProps {
  onGenerate: (image: string, isBlankTemplate?: boolean) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
  aspectRatio?: '1:1' | '16:9' | '4:3' | '9:16' | '3:4';
  blankTemplate?: boolean;
}

export default function ManualMode({ onGenerate, onLoading, onError, aspectRatio = '1:1', blankTemplate = false }: ManualModeProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    onLoading(true);

    try {
      const response = await fetch('/api/meme/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          blankTemplate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate meme');
      }

      onGenerate(data.image, data.blankTemplate);
    } catch (error: any) {
      console.error('Error generating meme:', error);
      onError(error.message || 'Failed to generate meme. Please try again.');
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main Input */}
      <div className="flex gap-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the meme you want to create in detail..."
          required
          rows={3}
          className="flex-1 px-4 py-3 bg-[#2d2d2d] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#10a37f] focus:ring-1 focus:ring-[#10a37f] transition-all resize-none"
        />
        <button
          type="submit"
          disabled={!prompt.trim()}
          className="px-6 bg-[#10a37f] hover:bg-[#0d8966] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors self-end flex items-center justify-center"
          title="Send prompt"
        >
          ⚡
        </button>
      </div>
    </form>
  );
}
