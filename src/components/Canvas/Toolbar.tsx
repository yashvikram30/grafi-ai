'use client';

import React from 'react';
import { 
  Type, 
  Square, 
  Circle, 
  Image as ImageIcon,
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Download,
  MousePointer,
  X,
  Sparkles,
  Wand2,
  Save,
  Pencil
} from 'lucide-react';
import CollapsibleSection from '../retro-ui/collapsible-section';
import { fabric } from '@/lib/fabric';
import { cn } from '@/utils/helpers';
import { DrawingMode } from '@/hooks/useCanvas';
// Image upload modal is managed at the CanvasEditor level

interface ToolbarProps {
  canvas: fabric.Canvas | null;
  drawingMode: DrawingMode;
  onDeleteSelected: () => void;
  onClearCanvas: () => void;
  onSetBackgroundColor: (color: string) => void;
  onSetZoom: (zoom: number) => void;
  onSetDrawingMode: (mode: DrawingMode) => void;
  onSetTool: (tool: 'select' | 'text' | 'rectangle' | 'circle' | 'image' | 'pencil') => void;
  onAIText?: () => void;
  onAIImage?: () => void;
  onSave?: () => void;
  zoom: number;
  isWalletConnected?: boolean;
}

export default function Toolbar({
  canvas,
  drawingMode,
  onDeleteSelected,
  onClearCanvas,
  onSetBackgroundColor,
  onSetZoom,
  onSetDrawingMode,
  onSetTool,
  onAIText,
  onAIImage,
  onSave,
  zoom,
  isWalletConnected = false
}: ToolbarProps) {

  const handleImageClick = () => {
    onSetTool('image');
  };


  const handleZoomIn = () => {
    onSetZoom(zoom * 1.2);
  };

  const handleZoomOut = () => {
    onSetZoom(zoom * 0.8);
  };

  const handleExport = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({ format: 'png' });
      const link = document.createElement('a');
      link.download = 'grafi-ai-design.png';
      link.href = dataURL;
      link.click();
    }
  };

  const tools: { mode: NonNullable<DrawingMode>; label: string; icon: React.ElementType; hint: string }[] = [
    { mode: 'select', label: 'Select', icon: MousePointer, hint: 'Select and move objects' },
    { mode: 'pencil', label: 'Pencil', icon: Pencil, hint: 'Draw freehand' },
    { mode: 'text', label: 'Text', icon: Type, hint: 'Click the canvas to add text' },
    { mode: 'rectangle', label: 'Rectangle', icon: Square, hint: 'Drag to draw a rectangle' },
    { mode: 'circle', label: 'Circle', icon: Circle, hint: 'Drag to draw a circle' },
  ];

  const colors = Array.from(new Set([
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF8000', '#800080',
    '#FF4444', '#00CCCC', '#4488FF', '#44FF44', '#FFFF44', '#FF44FF', '#44FFFF', '#FF8844', '#8844FF', '#FF44CC',
    '#FF1493', '#32CD32', '#FF6347', '#00CED1', '#FF4500', '#9370DB', '#20B2AA', '#FF69B4', '#FFD700', '#FFA500',
    '#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFA07A', '#FFC0CB', '#D8BFD8', '#F5DEB3', '#97F0E5',
    '#8B0000', '#006400', '#00008B', '#B8860B', '#008B8B', '#2F4F4F', '#8B4513', '#2E8B57', '#4B0082',
  ]));

  return (
    <div className="px-3 py-3">
      {/* Drawing Tools */}
      <CollapsibleSection title="Drawing Tools" defaultExpanded>
        <div className="grid grid-cols-3 gap-2">
          {tools.map(({ mode, label, icon: Icon, hint }) => (
            <button
              key={label}
              onClick={() => {
                onSetDrawingMode(mode);
                onSetTool(mode);
              }}
              className={cn(
                "retro-button flex flex-col items-center justify-center gap-1 px-1 py-3 text-center",
                drawingMode === mode ? "bg-[var(--retro-accent)] shadow-[1px_1px_0_#000] translate-y-px" : "hover:bg-[var(--retro-accent)]"
              )}
              title={hint}
              aria-pressed={drawingMode === mode}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold">{label}</span>
            </button>
          ))}

          <button
            onClick={handleImageClick}
            className="retro-button flex flex-col items-center justify-center gap-1 px-1 py-3 text-center hover:bg-[var(--retro-accent)]"
            title="Add an image from your device"
          >
            <ImageIcon className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs font-semibold">Image</span>
          </button>
        </div>
      </CollapsibleSection>

      {/* AI Tools */}
      {(onAIText || onAIImage) && (
        <CollapsibleSection title="AI Tools" defaultExpanded>
          <div className="space-y-4">
            {onAIText && (
              <button
                onClick={onAIText}
                className="retro-button w-full flex items-center justify-center space-x-3 p-4 transition-colors hover:bg-[var(--retro-accent)] text-center"
                title="AI Text Generation"
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-bold text-center">AI Text</span>
              </button>
            )}
            
            {onAIImage && (
              <button
                onClick={onAIImage}
                className="retro-button w-full flex items-center justify-center space-x-3 p-4 transition-colors hover:bg-[var(--retro-accent)] text-center"
                title="AI Image Generation"
              >
                <Wand2 className="w-5 h-5" />
                <span className="text-sm font-bold text-center">AI Image</span>
              </button>
            )}
          </div>
        </CollapsibleSection>
      )}


      {/* Color Palette */}
      <CollapsibleSection title="Background Color" defaultExpanded={false}>
        <div className="space-y-3">
          <div className="grid grid-cols-8 gap-1.5">
            {colors.map((color, i) => (
              <button
                key={`${color}-${i}`}
                onClick={() => onSetBackgroundColor(color)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform",
                  canvas?.backgroundColor === color ? "border-black ring-2 ring-[var(--retro-accent)] scale-110" : "border-gray-500"
                )}
                style={{ backgroundColor: color }}
                title={color}
                aria-label={`Set background to ${color}`}
              />
            ))}
          </div>
          <label className="flex items-center justify-between gap-3 text-xs font-semibold">
            Custom color
            <input
              type="color"
              onChange={(e) => onSetBackgroundColor(e.target.value)}
              className="h-8 w-14 cursor-pointer border-2 border-black rounded bg-white p-0.5"
              aria-label="Pick a custom background color"
            />
          </label>
        </div>
      </CollapsibleSection>

      {/* Zoom Controls */}
      <CollapsibleSection title="Zoom" defaultExpanded={false}>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleZoomOut}
              className="retro-button p-3 hover:bg-[var(--retro-accent)] text-center"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <div className="flex-1 text-center">
              <span className="text-lg text-[var(--retro-text)] font-bold text-center">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            
            <button
              onClick={handleZoomIn}
              className="retro-button p-3 hover:bg-[var(--retro-accent)] text-center"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={() => onSetZoom(1)}
            className="retro-button w-full flex items-center justify-center space-x-3 p-4 hover:bg-[var(--retro-accent)] text-center"
            title="Reset Zoom to 100%"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-bold text-center">Reset Zoom</span>
          </button>
        </div>
      </CollapsibleSection>

      {/* Storage Actions */}
      <CollapsibleSection title="Storage" defaultExpanded={false}>
        <div className="space-y-4">
          <button
            onClick={() => {
              onSetDrawingMode('select');
              onSetTool('select');
              onSave?.();
            }}
            disabled={!isWalletConnected}
            className={cn(
              "retro-button w-full flex items-center justify-center space-x-3 p-4 transition-colors text-center",
              isWalletConnected
                ? "hover:bg-[var(--retro-accent)]"
                : "opacity-50 cursor-not-allowed"
            )}
            title={!isWalletConnected ? "Connect wallet to save/load designs" : "Save/Load design to/from Walrus"}
          >
            <Save className="w-5 h-5" />
            <span className="text-sm font-bold text-center">
              {isWalletConnected ? "Save/Load" : "Connect Wallet to Save/Load"}
            </span>
          </button>
        </div>
      </CollapsibleSection>

      

      {/* Actions */}
      <CollapsibleSection title="Actions" defaultExpanded={false}>
        <div className="space-y-4">
          <button
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteSelected(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteSelected(); }}
            className="retro-button w-full flex items-center justify-center space-x-3 p-4 transition-colors hover:bg-red-500 hover:text-white text-center"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-sm font-bold text-center">Delete Selected</span>
          </button>
          
          <button
            onClick={onClearCanvas}
            className="retro-button w-full flex items-center justify-center space-x-3 p-4 transition-colors hover:bg-red-500 hover:text-white text-center"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-bold text-center">Clear Canvas</span>
          </button>
          
          <button
            onClick={handleExport}
            className="retro-button w-full flex items-center justify-center space-x-3 p-4 transition-colors hover:bg-[var(--retro-accent)] text-center"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm font-bold text-center">Export PNG</span>
          </button>
        </div>
      </CollapsibleSection>

      {/* Image Modal */}
      {/* Managed by parent */}
      
      
    </div>
  );
}
