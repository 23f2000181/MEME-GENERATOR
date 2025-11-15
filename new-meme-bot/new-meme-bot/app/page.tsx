'use client';

import { useState } from 'react';
import AutoMode from './components/AutoMode';
import ManualMode from './components/ManualMode';
import TextEditor from './components/TextEditor';
import History from './components/History';

export default function Home() {
  const [view, setView] = useState<'generator' | 'history'>('generator');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isBlankTemplate, setIsBlankTemplate] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
            🎨 AI Meme Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Powered by Gemini 2.5 Flash & Nano Banana
          </p>

          {/* View Toggle */}
          <div className="flex justify-center gap-2 mt-6 bg-white dark:bg-gray-800 p-1 rounded-lg inline-flex shadow-lg">
            <button
              onClick={() => setView('generator')}
              className={`py-2.5 px-6 rounded-md font-semibold transition-all ${
                view === 'generator'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              ✨ Create Meme
            </button>
            <button
              onClick={() => setView('history')}
              className={`py-2.5 px-6 rounded-md font-semibold transition-all ${
                view === 'history'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              📜 History
            </button>
          </div>
        </div>

        {view === 'history' ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <History />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            {/* Mode Selector */}
            <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setMode('auto')}
                className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all ${
                  mode === 'auto'
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                ✨ Auto Mode
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 py-2.5 px-4 rounded-md font-semibold transition-all ${
                  mode === 'manual'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                ⚡ Manual Mode
              </button>
            </div>

            {/* Mode Description */}
            <div className="mb-6 p-4 bg-purple-50 dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {mode === 'auto' ? (
                  <>
                    <strong>Auto Mode:</strong> Describe your meme idea and let
                    AI generate a detailed, structured meme with captions.
                  </>
                ) : (
                  <>
                    <strong>Manual Mode:</strong> Write a direct prompt for the
                    image generator. Full creative control!
                  </>
                )}
              </p>
            </div>

            {/* Mode-specific form */}
            {mode === 'auto' ? (
              <AutoMode
                onGenerate={(image) => {
                  setGeneratedImage(image);
                  setIsBlankTemplate(false);
                  setIsEditingText(false);
                }}
                onLoading={setLoading}
                onError={setError}
              />
            ) : (
              <ManualMode
                onGenerate={(image, isBlank) => {
                  setGeneratedImage(image);
                  setIsBlankTemplate(isBlank || false);
                  setIsEditingText(isBlank || false);
                }}
                onLoading={setLoading}
                onError={setError}
              />
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                  ⚠️ {error}
                </p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {isEditingText ? 'Text Editor' : 'Generated Meme'}
            </h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 dark:border-purple-400"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Generating your meme...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  This may take a few seconds
                </p>
              </div>
            ) : generatedImage ? (
              isEditingText ? (
                <TextEditor
                  imageUrl={generatedImage}
                  onSave={(editedImage) => {
                    setGeneratedImage(editedImage);
                    setIsEditingText(false);
                    setIsBlankTemplate(false);
                  }}
                  onCancel={() => {
                    setIsEditingText(false);
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <img
                      src={generatedImage}
                      alt="Generated meme"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="flex gap-3">
                    {mode === 'manual' && (
                      <button
                        onClick={() => setIsEditingText(true)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        ✏️ Add Text
                      </button>
                    )}
                    <a
                      href={generatedImage}
                      download="meme.png"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                    >
                      💾 Download
                    </a>
                    <button
                      onClick={() => {
                        setGeneratedImage(null);
                        setError(null);
                        setIsEditingText(false);
                        setIsBlankTemplate(false);
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      🔄 New Meme
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400 dark:text-gray-500">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-lg font-medium">
                  Your meme will appear here
                </p>
                <p className="text-sm mt-2">
                  Fill out the form and click Generate!
                </p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Built with Next.js • Powered by Google Gemini 2.5 Flash & Nano
            Banana
          </p>
        </div>
      </div>
    </main>
  );
}
