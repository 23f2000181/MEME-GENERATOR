'use client';

import { useState } from 'react';

interface ManualModeProps {
  onGenerate: (image: string, isBlankTemplate?: boolean) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

export default function ManualMode({ onGenerate, onLoading, onError }: ManualModeProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16' | '3:4'>('1:1');
  const [blankTemplate, setBlankTemplate] = useState(false);

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

  const examplePrompts = [
    'A surprised Pikachu face with text "WHEN THE CODE WORKS" at top and "ON THE FIRST TRY" at bottom, bold white Impact font with black outline',
    'Drake meme format: top panel shows Drake rejecting something, bottom panel shows Drake approving, classic meme style',
    'Distracted boyfriend meme: guy looking at another woman while his girlfriend looks disapproving, photorealistic style',
  ];

  const blankTemplateExamples = [
    'A surprised Pikachu face, clean background, plenty of empty space at top and bottom for text overlays',
    'Drake meme format: top panel shows Drake with rejecting gesture, bottom panel shows Drake with approving gesture, simple clean background with space for text',
    'Dog sitting at computer looking stressed, clean scene with ample space at top and bottom for text, no text or captions in the image',
  ];

  const fillExample = (example: string) => {
    setPrompt(example);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Image Prompt <span className="text-red-500">*</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the meme you want to create in detail..."
          required
          rows={6}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: Be specific about scenes, expressions, text placement, and
          style for best results
        </p>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Aspect Ratio
        </label>
        <select
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as any)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="1:1">1:1 (Square)</option>
          <option value="16:9">16:9 (Widescreen)</option>
          <option value="4:3">4:3 (Standard)</option>
          <option value="9:16">9:16 (Vertical)</option>
          <option value="3:4">3:4 (Portrait)</option>
        </select>
      </div>

      {/* Blank Template Option */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg border border-cyan-200 dark:border-gray-500">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={blankTemplate}
            onChange={(e) => setBlankTemplate(e.target.checked)}
            className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 rounded"
          />
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              🎨 Generate Blank Template (Add Your Own Text Later)
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Creates an image WITHOUT text/captions, with plenty of space for you to add custom text afterwards using the text editor.
            </p>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!prompt.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        ⚡ Generate Meme
      </button>

      {/* Example Prompts */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Example Prompts (click to use):
        </p>
        <div className="space-y-2">
          {(blankTemplate ? blankTemplateExamples : examplePrompts).map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => fillExample(example)}
              className="w-full text-left px-4 py-2 rounded-lg bg-blue-50 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 border border-blue-200 dark:border-gray-600 transition-colors"
            >
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                {example}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border border-blue-200 dark:border-gray-600">
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
          📝 Pro Tips:
        </p>
        {blankTemplate ? (
          <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
            <li>Request "plenty of space at top and bottom" for text areas</li>
            <li>Mention "no text" or "no captions" to ensure a clean template</li>
            <li>Specify "clean background" for easier text overlay</li>
            <li>After generation, use the text editor to add your custom text</li>
          </ul>
        ) : (
          <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
            <li>Be detailed about scene composition and character expressions</li>
            <li>
              For text overlays, specify font (Impact), color (white), and outline
              (black)
            </li>
            <li>Mention specific meme formats if you want to recreate them</li>
            <li>Include lighting and style preferences (photorealistic, cartoon,
              etc.)</li>
          </ul>
        )}
      </div>
    </form>
  );
}
