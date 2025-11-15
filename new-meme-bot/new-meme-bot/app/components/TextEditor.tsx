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
    <div className="space-y-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ✏️ Text Editor Mode - Add text layers to your meme template
        </p>
      </div>

      {/* Preview */}
      <div className="relative rounded-lg overflow-hidden border-2 border-blue-300 dark:border-blue-600">
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

      {/* Text Layers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Text Layers ({textLayers.length})
          </h3>
          <button
            type="button"
            onClick={addTextLayer}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add Text
          </button>
        </div>

        {textLayers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No text layers yet. Click "Add Text" to get started!</p>
          </div>
        )}

        {textLayers.map((layer) => (
          <div
            key={layer.id}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedLayer === layer.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setSelectedLayer(layer.id)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {layer.text || 'Empty text'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLayer(layer.id);
                }}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Text Editor Controls */}
      {selectedLayerData && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Edit Text Layer
          </h4>

          {/* Text Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Text
            </label>
            <input
              type="text"
              value={selectedLayerData.text}
              onChange={(e) => updateLayer(selectedLayerData.id, { text: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Horizontal Position (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={selectedLayerData.x}
                onChange={(e) => updateLayer(selectedLayerData.id, { x: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vertical Position (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={selectedLayerData.y}
                onChange={(e) => updateLayer(selectedLayerData.id, { y: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Font Size: {selectedLayerData.fontSize}px
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={selectedLayerData.fontSize}
              onChange={(e) => updateLayer(selectedLayerData.id, { fontSize: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Text Color
              </label>
              <input
                type="color"
                value={selectedLayerData.color}
                onChange={(e) => updateLayer(selectedLayerData.id, { color: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Outline Color
              </label>
              <input
                type="color"
                value={selectedLayerData.strokeColor}
                onChange={(e) => updateLayer(selectedLayerData.id, { strokeColor: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Outline Width: {selectedLayerData.strokeWidth}px
            </label>
            <input
              type="range"
              min="0"
              max="8"
              value={selectedLayerData.strokeWidth}
              onChange={(e) => updateLayer(selectedLayerData.id, { strokeWidth: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Font
            </label>
            <select
              value={selectedLayerData.fontFamily}
              onChange={(e) => updateLayer(selectedLayerData.id, { fontFamily: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all"
        >
          {isProcessing ? 'Processing...' : '✅ Save Meme with Text'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
