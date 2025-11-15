'use client';

import { useState } from 'react';

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  strokeColor: string;
  strokeWidth: number;
}

interface TextEditorProps {
  imageUrl: string;
  onSave: (editedImage: string) => void;
  onCancel: () => void;
}

export default function TextEditor({ imageUrl, onSave, onCancel }: TextEditorProps) {
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      text: 'New Text',
      x: 50,
      y: textLayers.length === 0 ? 20 : textLayers.length === 1 ? 80 : 50,
      fontSize: 48,
      color: '#FFFFFF',
      fontFamily: 'Impact',
      strokeColor: '#000000',
      strokeWidth: 3,
    };
    setTextLayers([...textLayers, newLayer]);
    setSelectedLayer(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(textLayers.map(layer =>
      layer.id === id ? { ...layer, ...updates } : layer
    ));
  };

  const deleteLayer = (id: string) => {
    setTextLayers(textLayers.filter(layer => layer.id !== id));
    if (selectedLayer === id) {
      setSelectedLayer(null);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/meme/add-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          textLayers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add text to image');
      }

      onSave(data.image);
    } catch (error: any) {
      console.error('Error adding text:', error);
      alert(error.message || 'Failed to add text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedLayerData = textLayers.find(layer => layer.id === selectedLayer);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="bg-[#2d2d2d] border border-[#10a37f] rounded-lg p-3">
        <p className="text-sm text-[#10a37f]">
          ✏️ Text Editor Mode - Add text layers to your meme template
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="relative rounded-lg overflow-hidden border-2 border-[#404040] bg-[#1a1a1a]">
            <img
              src={imageUrl}
              alt="Meme template"
              className="w-full h-auto"
            />
            {/* Text layers preview */}
            <div className="absolute inset-0 pointer-events-none">
              {textLayers.map((layer) => (
                <div
                  key={layer.id}
                  className="absolute"
                  style={{
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <p
                    className="text-center whitespace-nowrap"
                    style={{
                      fontSize: `${layer.fontSize}px`,
                      color: layer.color,
                      fontFamily: layer.fontFamily,
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      WebkitTextStroke: `${layer.strokeWidth}px ${layer.strokeColor}`,
                      paintOrder: 'stroke fill',
                      textShadow: `2px 2px 0 ${layer.strokeColor}, -2px -2px 0 ${layer.strokeColor}, 2px -2px 0 ${layer.strokeColor}, -2px 2px 0 ${layer.strokeColor}`,
                    }}
                  >
                    {layer.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Text Layers List */}
          <div className="bg-[#1a1a1a] border border-[#404040] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-white">
                Layers ({textLayers.length})
              </h3>
              <button
                type="button"
                onClick={addTextLayer}
                className="px-2 py-1 bg-[#10a37f] hover:bg-[#0d8966] text-white rounded text-xs font-medium transition-colors"
              >
                + Add
              </button>
            </div>

            {textLayers.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-xs">
                <p>No text layers yet</p>
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {textLayers.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`w-full text-left px-2 py-2 rounded text-xs transition-all ${
                    selectedLayer === layer.id
                      ? 'bg-[#10a37f]/20 border border-[#10a37f] text-[#10a37f]'
                      : 'bg-[#2d2d2d] border border-[#404040] text-gray-300 hover:border-[#10a37f]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate font-medium">{layer.text || 'Empty'}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer.id);
                      }}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      ✕
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Text Editor Controls */}
      {selectedLayerData && (
        <div className="bg-[#1a1a1a] border border-[#404040] rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-white text-sm">Edit Layer</h4>

          {/* Text Content */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1 block">Text</label>
            <input
              type="text"
              value={selectedLayerData.text}
              onChange={(e) => updateLayer(selectedLayerData.id, { text: e.target.value })}
              className="w-full px-3 py-2 rounded border border-[#404040] bg-[#2d2d2d] text-white text-sm focus:outline-none focus:border-[#10a37f]"
            />
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1 block">X Position %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={selectedLayerData.x}
                onChange={(e) => updateLayer(selectedLayerData.id, { x: Number(e.target.value) })}
                className="w-full px-2 py-2 rounded border border-[#404040] bg-[#2d2d2d] text-white text-sm focus:outline-none focus:border-[#10a37f]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1 block">Y Position %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={selectedLayerData.y}
                onChange={(e) => updateLayer(selectedLayerData.id, { y: Number(e.target.value) })}
                className="w-full px-2 py-2 rounded border border-[#404040] bg-[#2d2d2d] text-white text-sm focus:outline-none focus:border-[#10a37f]"
              />
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">
              Font Size: {selectedLayerData.fontSize}px
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={selectedLayerData.fontSize}
              onChange={(e) => updateLayer(selectedLayerData.id, { fontSize: Number(e.target.value) })}
              className="w-full accent-[#10a37f]"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Text Color</label>
              <input
                type="color"
                value={selectedLayerData.color}
                onChange={(e) => updateLayer(selectedLayerData.id, { color: e.target.value })}
                className="w-full h-8 rounded border border-[#404040] cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Outline Color</label>
              <input
                type="color"
                value={selectedLayerData.strokeColor}
                onChange={(e) => updateLayer(selectedLayerData.id, { strokeColor: e.target.value })}
                className="w-full h-8 rounded border border-[#404040] cursor-pointer"
              />
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">
              Outline Width: {selectedLayerData.strokeWidth}px
            </label>
            <input
              type="range"
              min="0"
              max="8"
              value={selectedLayerData.strokeWidth}
              onChange={(e) => updateLayer(selectedLayerData.id, { strokeWidth: Number(e.target.value) })}
              className="w-full accent-[#10a37f]"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1 block">Font</label>
            <select
              value={selectedLayerData.fontFamily}
              onChange={(e) => updateLayer(selectedLayerData.id, { fontFamily: e.target.value })}
              className="w-full px-3 py-2 rounded border border-[#404040] bg-[#2d2d2d] text-gray-300 text-sm focus:outline-none focus:border-[#10a37f]"
            >
              <option value="Impact">Impact (Classic Meme)</option>
              <option value="Arial Black">Arial Black</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isProcessing || textLayers.length === 0}
          className="flex-1 bg-[#10a37f] hover:bg-[#0d8966] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all text-sm"
        >
          {isProcessing ? '⏳ Processing...' : '✅ Save Meme with Text'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 bg-[#2d2d2d] hover:bg-[#3d3d3d] disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 font-bold py-3 px-4 rounded-lg transition-all text-sm"
        >
          ✕ Cancel
        </button>
      </div>
    </div>
  );
}
