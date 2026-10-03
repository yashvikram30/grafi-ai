'use client';

import React from 'react';
import {
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  Trash2,
  Download,
  MousePointer2,
  Eraser,
  Wand2,
  Save,
  Pencil,
} from 'lucide-react';
import { fabric } from '@/lib/fabric';
import { cn } from '@/utils/helpers';
import { ToolId } from '@/hooks/useCanvas';

interface ToolbarProps {
  canvas: fabric.Canvas | null;
  activeTool: ToolId;
  /** The AI Image panel is open */
  aiActive?: boolean;
  onSelectTool: (tool: ToolId) => void;
  /** What the palette is currently editing, e.g. "Brush color" */
  colorLabel: string;
  color: string;
  onPickColor: (color: string) => void;
  onDeleteSelected: () => void;
  onClearCanvas: () => void;
  onAIImage?: () => void;
  onSave?: () => void;
  isWalletConnected?: boolean;
}

const TOOLS: { id: ToolId; label: string; icon: React.ElementType; hint: string }[] = [
  { id: 'select', label: 'Select', icon: MousePointer2, hint: 'Click to select and move objects' },
  { id: 'pencil', label: 'Pencil', icon: Pencil, hint: 'Draw freehand on the canvas' },
  { id: 'text', label: 'Text', icon: Type, hint: 'Drag on the canvas to draw a text box' },
  { id: 'rectangle', label: 'Rectangle', icon: Square, hint: 'Drag on the canvas to draw a rectangle' },
  { id: 'circle', label: 'Ellipse', icon: Circle, hint: 'Drag on the canvas to draw an ellipse' },
  { id: 'image', label: 'Image', icon: ImageIcon, hint: 'Add a picture from your device or a link' },
];

// A classic paint-style palette: 3 rows of 8
const PALETTE = [
  '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8',
  '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea',
  '#3f48cc', '#a349a4', '#7092be', '#c8bfe7', '#97f0e5', '#ff90e8', '#ffd23f', '#2f4f4f',
];

const GROUP_LABEL = 'text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5';

export default function Toolbar({
  canvas,
  activeTool,
  aiActive = false,
  onSelectTool,
  colorLabel,
  color,
  onPickColor,
  onDeleteSelected,
  onClearCanvas,
  onAIImage,
  onSave,
  isWalletConnected = false,
}: ToolbarProps) {
  const activeInfo = TOOLS.find((t) => t.id === activeTool) ?? TOOLS[0];
  const current = color.toLowerCase();

  const handleExport = () => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'grafi-ai-design.png';
    link.href = canvas.toDataURL({ format: 'png' });
    link.click();
  };

  return (
    <div className="p-2 space-y-3">
      {/* Tool grid */}
      <section aria-label="Tools">
        <div className={GROUP_LABEL}>Tools</div>
        <div className="grid grid-cols-3 gap-1.5">
          {TOOLS.map(({ id, label, icon: Icon, hint }) => (
            <button
              key={id}
              onClick={() => onSelectTool(id)}
              className="paint-tool"
              aria-pressed={activeTool === id && !aiActive}
              aria-label={label}
              title={`${label}: ${hint}`}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        {/* Tool options box, like the one under the toolbox in Paint */}
        <div className="paint-inset mt-2 px-2 py-1.5 min-h-[3.25rem]" aria-live="polite">
          <div className="text-xs font-bold">{aiActive ? 'AI Image' : activeInfo.label}</div>
          <div className="text-[11px] leading-snug text-neutral-600">
            {aiActive ? 'Describe an image and add it to the canvas' : activeInfo.hint}
          </div>
        </div>
      </section>

      {/* AI */}
      {onAIImage && (
        <button
          onClick={onAIImage}
          aria-pressed={aiActive}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[var(--pop-pink)] border-2 border-black rounded text-sm font-bold transition-all",
            aiActive
              ? "shadow-[inset_2px_2px_0_rgba(0,0,0,0.4)] translate-x-px translate-y-px"
              : "shadow-[2px_2px_0_#000] hover:-translate-y-px hover:shadow-[3px_3px_0_#000] active:translate-y-px active:shadow-[1px_1px_0_#000]"
          )}
          title="Generate an image with AI"
        >
          <Wand2 className="w-4 h-4" />
          AI Image
        </button>
      )}

      <hr className="border-t-2 border-black/15" />

      {/* Colors */}
      <section aria-label="Colors">
        <div className={GROUP_LABEL}>{colorLabel}</div>
        <div className="flex items-stretch gap-2 mb-2">
          <div
            className="paint-inset w-12 h-12 shrink-0 p-1"
            title={`Current color: ${current}`}
          >
            <div className="w-full h-full border border-black/60" style={{ backgroundColor: current }} />
          </div>
          <label
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold border-2 border-black rounded bg-white cursor-pointer hover:bg-[var(--retro-accent)] transition-colors"
            title="Pick any color"
          >
            Edit colors
            <input
              type="color"
              value={current}
              onChange={(e) => onPickColor(e.target.value)}
              className="sr-only"
              aria-label={`Pick a custom ${colorLabel.toLowerCase()}`}
            />
          </label>
        </div>
        <div className="grid grid-cols-8 gap-[3px]">
          {PALETTE.map((swatch) => (
            <button
              key={swatch}
              onClick={() => onPickColor(swatch)}
              className={cn(
                'paint-swatch',
                current === swatch && 'ring-2 ring-offset-1 ring-black'
              )}
              style={{ backgroundColor: swatch }}
              title={swatch}
              aria-label={`Set ${colorLabel.toLowerCase()} to ${swatch}`}
            />
          ))}
        </div>
      </section>

      <hr className="border-t-2 border-black/15" />

      {/* Actions */}
      <section aria-label="Actions">
        <div className={GROUP_LABEL}>Actions</div>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteSelected(); }}
            className="paint-tool hover:!bg-red-500 hover:!text-white"
            aria-label="Delete selected"
            title="Delete selected objects (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClearCanvas}
            className="paint-tool hover:!bg-red-500 hover:!text-white"
            aria-label="Clear canvas"
            title="Clear the whole canvas"
          >
            <Eraser className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="paint-tool"
            aria-label="Export PNG"
            title="Export the canvas as a PNG"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              onSelectTool('select');
              onSave?.();
            }}
            disabled={!isWalletConnected}
            className="paint-tool disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Save or load"
            title={isWalletConnected ? 'Save or load a design (Ctrl+S)' : 'Connect a wallet to save'}
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
