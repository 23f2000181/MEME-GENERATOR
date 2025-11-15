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
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16' | '3:4'>('1:1');
  const [blankTemplate, setBlankTemplate] = useState(false);

  return (
    <main className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#1a1a1a] border-r border-[#404040] flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="p-4 border-b border-[#404040]">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🎨 Meme AI
          </h1>
          <p className="text-xs text-gray-400 mt-1">Powered by Gemini & Nano Banana</p>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => {
                setView('generator');
                setGeneratedImage(null);
                setError(null);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                view === 'generator'
                  ? 'bg-[#10a37f] text-white'
                  : 'text-gray-300 hover:bg-[#2d2d2d]'
              }`}
            >
              <span className="text-lg">✨</span>
              <span className="font-medium">Create Meme</span>
            </button>
            <button
              onClick={() => setView('history')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                view === 'history'
                  ? 'bg-[#10a37f] text-white'
                  : 'text-gray-300 hover:bg-[#2d2d2d]'
              }`}
            >
              <span className="text-lg">📜</span>
              <span className="font-medium">History</span>
            </button>
          </nav>

          {/* Mode Selector */}
          {view === 'generator' && (
            <div className="mx-4 mt-8 space-y-2">
              <p className="text-xs font-semibold text-gray-400 px-2">MODE</p>
              <button
                onClick={() => {
                  setMode('auto');
                  setGeneratedImage(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                  mode === 'auto'
                    ? 'bg-[#2d2d2d] text-[#10a37f] border border-[#10a37f]'
                    : 'text-gray-400 hover:bg-[#2d2d2d]'
                }`}
              >
                Auto Mode
              </button>
              <button
                onClick={() => {
                  setMode('manual');
                  setGeneratedImage(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                  mode === 'manual'
                    ? 'bg-[#2d2d2d] text-[#10a37f] border border-[#10a37f]'
                    : 'text-gray-400 hover:bg-[#2d2d2d]'
                }`}
              >
                Manual Mode
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#404040] text-xs text-gray-500">
          <p>Version 1.0</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0f0f0f]">
          {view === 'history' ? (
            <div className="flex-1 overflow-y-auto p-6">
              <History />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {generatedImage && !isEditingText ? (
                  <div className="flex justify-center">
                    <div className="max-w-2xl w-full space-y-4">
                      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#404040]">
                        <img
                          src={generatedImage}
                          alt="Generated meme"
                          className="w-full rounded-lg"
                        />
                      </div>
                      <div className="flex gap-3 justify-center flex-wrap">
                        {mode === 'manual' && (
                          <button
                            onClick={() => setIsEditingText(true)}
                            className="px-6 py-2 bg-[#10a37f] hover:bg-[#0d8966] text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            ✏️ Edit Text
                          </button>
                        )}
                        <a
                          href={generatedImage}
                          download="meme.png"
                          className="px-6 py-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white rounded-lg transition-colors text-sm font-medium text-center"
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
                          className="px-6 py-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          🔄 Create New
                        </button>
                      </div>
                    </div>
                  </div>
                ) : isEditingText ? (
                  <div className="flex justify-center">
                    <div className="max-w-4xl w-full">
                      <TextEditor
                        imageUrl={generatedImage!}
                        onSave={(editedImage) => {
                          setGeneratedImage(editedImage);
                          setIsEditingText(false);
                          setIsBlankTemplate(false);
                        }}
                        onCancel={() => {
                          setIsEditingText(false);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                      <div className="text-7xl">🎨</div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-[#10a37f] to-cyan-400 bg-clip-text text-transparent">
                        Welcome to AI Meme Generator
                      </h2>
                      <p className="text-gray-400 text-lg max-w-md mx-auto">
                        Create hilarious, professional-quality memes powered by AI in seconds
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#404040]">
                          <div className="text-4xl mb-2">⚡</div>
                          <p className="text-sm font-semibold">Lightning Fast</p>
                          <p className="text-xs text-gray-500 mt-1">Generate memes in seconds</p>
                        </div>
                        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#404040]">
                          <div className="text-4xl mb-2">🤖</div>
                          <p className="text-sm font-semibold">AI Powered</p>
                          <p className="text-xs text-gray-500 mt-1">Gemini & Nano Banana</p>
                        </div>
                        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#404040]">
                          <div className="text-4xl mb-2">🎯</div>
                          <p className="text-sm font-semibold">Full Control</p>
                          <p className="text-xs text-gray-500 mt-1">Edit text & customize</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#404040] border-t-[#10a37f]"></div>
                      <p className="text-gray-400">Generating your meme...</p>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="flex justify-center">
                    <div className="max-w-2xl w-full bg-red-900/20 border border-red-800 rounded-lg p-4">
                      <p className="text-red-400 text-sm">⚠️ {error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area - Chat Style */}
              {!isEditingText && (
                <div className="bg-[#1a1a1a] border-t border-[#404040] p-6">
                  <div className="max-w-4xl mx-auto">
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
                        aspectRatio={aspectRatio}
                        blankTemplate={blankTemplate}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Advanced Dashboard */}
        <div className="w-80 bg-[#1a1a1a] border-l border-[#404040] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#404040]">
            <h2 className="text-lg font-bold">⚙️ Advanced Settings</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Customization Options - Only for Manual Mode */}
            {mode === 'manual' && view === 'generator' && (
              <div className="space-y-3 bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] border border-[#404040] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⚙️</span>
                  <p className="text-sm font-semibold text-[#10a37f]">Customization</p>
                  <span className="text-[#10a37f]">→</span>
                </div>
                
                {/* Aspect Ratio */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-2 block">
                    📐 Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-[#404040] rounded-lg text-gray-300 text-sm focus:outline-none focus:border-[#10a37f]"
                  >
                    <option value="1:1">1:1 (Square)</option>
                    <option value="16:9">16:9 (Widescreen)</option>
                    <option value="4:3">4:3 (Standard)</option>
                    <option value="9:16">9:16 (Vertical)</option>
                    <option value="3:4">3:4 (Portrait)</option>
                  </select>
                </div>

                {/* Blank Template Option */}
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-[#1a1a1a] rounded border border-[#404040] hover:border-[#10a37f] transition-colors">
                  <input
                    type="checkbox"
                    checked={blankTemplate}
                    onChange={(e) => setBlankTemplate(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#10a37f]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-200">
                      Generate Blank Template
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Image without text, with space to add custom text later
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Quick Stats */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400">📊 QUICK STATS</p>
              <div className="bg-[#2d2d2d] rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Mode:</span>
                  <span className="text-[#10a37f] font-semibold capitalize">{mode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-semibold ${loading ? 'text-yellow-400' : generatedImage ? 'text-[#10a37f]' : 'text-gray-400'}`}>
                    {loading ? 'Generating...' : generatedImage ? 'Ready' : 'Idle'}
                  </span>
                </div>
              </div>
            </div>

            {/* Model Info */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400">🤖 AI MODELS</p>
              <div className="bg-[#2d2d2d] rounded-lg p-3 space-y-2">
                <div className="text-sm">
                  <p className="text-gray-400 text-xs mb-1">Primary:</p>
                  <p className="text-[#10a37f] font-semibold text-sm">Google Gemini 2.5</p>
                </div>
                <div className="text-sm border-t border-[#404040] pt-2">
                  <p className="text-gray-400 text-xs mb-1">Secondary:</p>
                  <p className="text-cyan-400 font-semibold text-sm">Nano Banana</p>
                </div>
              </div>
            </div>

            {/* Tips & Tricks */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400">💡 TIPS & TRICKS</p>
              <div className="bg-[#2d2d2d] rounded-lg p-3 space-y-2 text-xs text-gray-300">
                <div className="flex gap-2">
                  <span className="text-[#10a37f]">✨</span>
                  <p>Be specific in your prompts for better results</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#10a37f]">✨</span>
                  <p>Use Auto Mode for quick ideas with AI captions</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#10a37f]">✨</span>
                  <p>Manual Mode gives you full creative control</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[#10a37f]">✨</span>
                  <p>Edit text layers after generation</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400">⚡ FEATURES</p>
              <div className="bg-[#2d2d2d] rounded-lg p-3 space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#10a37f]" />
                  <span className="text-gray-300">Auto Save</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#10a37f]" />
                  <span className="text-gray-300">Dark Mode</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-[#10a37f]" />
                  <span className="text-gray-300">Notifications</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#404040] bg-[#2d2d2d] text-center">
            <p className="text-xs text-gray-500">
              v1.0 | Powered by <br /> Gemini & Nano Banana
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
