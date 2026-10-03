'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fabric } from '@/lib/fabric';
import {
  MousePointer2,
  Pencil,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Trash2,
  Copy,
  BringToFront,
  SendToBack,
  Download,
  Wand2,
  Save,
  FolderOpen,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  X,
  Info,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { AVAILABLE_FONTS } from '@/utils/fontLoader';
import { ToolId, ToolSettings } from '@/hooks/useCanvas';
import AIImageModal from '../AI/AIImageModal';
import WalrusPopup from '../Storage/WalrusPopup';
import { DesignsList } from './DesignsList';
import { useMongoDBDesigns } from '../../hooks/useMongoDBDesigns';
import { useCurrentAccount } from '@mysten/dapp-kit';
import {
  Section,
  FieldLabel,
  ColorField,
  SliderField,
  NumberField,
  ToggleButton,
  toHex,
} from './PanelControls';

interface PropertyPanelProps {
  canvas: fabric.Canvas | null;
  selectedObjects: fabric.Object[];
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  toolSettings: ToolSettings;
  onToolSettingsChange: (patch: Partial<ToolSettings>) => void;
  /** Changes whenever something outside React state (the canvas) was edited */
  revision: number;
  /** Call after editing an object so the rest of the editor re-reads it */
  onChange: () => void;
  onSetBackgroundColor: (color: string) => void;
  onDeleteSelected: () => void;
  onExport?: (format: 'json' | 'svg' | 'png') => any;
  onAddImage?: (url: string) => void;
  onOpenAI?: () => void;
  activeAIPanel?: 'image' | null;
  onCloseAIPanel?: () => void;
  onLoad?: (designData: any) => void;
  onWalrusActionRef?: React.MutableRefObject<((action: 'save' | 'load') => void) | null>;
  onRefreshDesigns?: () => void;
}

const TOOL_INFO: Record<ToolId, { title: string; hint: string; icon: React.ElementType }> = {
  select: { title: 'Select', hint: 'Click an object on the canvas to edit it.', icon: MousePointer2 },
  pencil: { title: 'Pencil', hint: 'Draw freehand. Settings apply to your next stroke.', icon: Pencil },
  text: { title: 'Text', hint: 'Drag on the canvas to draw a text box, then type.', icon: Type },
  rectangle: { title: 'Rectangle', hint: 'Drag on the canvas to draw. Settings apply to the next shape.', icon: Square },
  circle: { title: 'Ellipse', hint: 'Drag on the canvas to draw. Settings apply to the next shape.', icon: Circle },
  image: { title: 'Image', hint: 'Add a picture to the canvas.', icon: ImageIcon },
};

const isTextObject = (obj: fabric.Object) => ['textbox', 'text', 'i-text'].includes(obj.type || '');

function objectLabel(obj: fabric.Object) {
  switch (obj.type) {
    case 'rect': return 'Rectangle';
    case 'circle': return 'Ellipse';
    case 'textbox':
    case 'text':
    case 'i-text': return 'Text';
    case 'image': return 'Image';
    case 'path': return 'Drawing';
    default: return 'Object';
  }
}

function objectIcon(obj: fabric.Object): React.ElementType {
  switch (obj.type) {
    case 'rect': return Square;
    case 'circle': return Circle;
    case 'textbox':
    case 'text':
    case 'i-text': return Type;
    case 'image': return ImageIcon;
    case 'path': return Pencil;
    default: return MousePointer2;
  }
}

function PanelHeader({ icon: Icon, title, hint, action }: { icon: React.ElementType; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b-2 border-black bg-[var(--retro-accent)]/40">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 shrink-0 flex items-center justify-center bg-white border-2 border-black rounded shadow-[2px_2px_0_#000]">
          <Icon className="w-4 h-4" />
        </span>
        <h2 className="text-sm font-bold flex-1 min-w-0 truncate">{title}</h2>
        {action}
      </div>
      {hint && <p className="mt-2 text-xs leading-snug text-neutral-700">{hint}</p>}
    </div>
  );
}

function FontSelect({ value, onChange }: { value: string; onChange: (font: string) => void }) {
  return (
    <div>
      <FieldLabel htmlFor="font-family">Font</FieldLabel>
      <select id="font-family" value={value} onChange={(e) => onChange(e.target.value)} className="field">
        {AVAILABLE_FONTS.map((font) => (
          <option key={font.name} value={font.name} style={{ fontFamily: font.fallback }}>
            {font.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------- Tool settings (what the next thing you draw will look like) ---------- */

function BrushSettings({ settings, onChange }: { settings: ToolSettings; onChange: (p: Partial<ToolSettings>) => void }) {
  return (
    <>
      <Section title="Brush">
        <ColorField label="Color" value={settings.brushColor} onChange={(c) => onChange({ brushColor: c })} />
        <SliderField label="Size" value={settings.brushWidth} min={1} max={60} unit="px" onChange={(v) => onChange({ brushWidth: v })} />
        <div>
          <FieldLabel>Preview</FieldLabel>
          <div className="paint-inset h-16 flex items-center justify-center overflow-hidden">
            <span
              className="rounded-full block"
              style={{ width: settings.brushWidth, height: settings.brushWidth, backgroundColor: settings.brushColor, maxWidth: 56, maxHeight: 56 }}
            />
          </div>
        </div>
      </Section>
    </>
  );
}

function ShapeSettings({ tool, settings, onChange }: { tool: 'rectangle' | 'circle'; settings: ToolSettings; onChange: (p: Partial<ToolSettings>) => void }) {
  const fill = settings.fillEnabled ? settings.fill : 'transparent';
  return (
    <Section title={tool === 'rectangle' ? 'Rectangle style' : 'Ellipse style'}>
      <div>
        <FieldLabel>Preview</FieldLabel>
        <div className="paint-inset h-20 flex items-center justify-center dot-grid">
          <svg width="96" height="56" viewBox="0 0 96 56" aria-hidden="true">
            {tool === 'rectangle' ? (
              <rect x="6" y="6" width="84" height="44" fill={fill} stroke={settings.stroke} strokeWidth={Math.min(settings.strokeWidth, 12)} />
            ) : (
              <ellipse cx="48" cy="28" rx="42" ry="22" fill={fill} stroke={settings.stroke} strokeWidth={Math.min(settings.strokeWidth, 12)} />
            )}
          </svg>
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
        <input
          type="checkbox"
          checked={!settings.fillEnabled}
          onChange={(e) => onChange({ fillEnabled: !e.target.checked })}
          className="w-4 h-4 accent-black"
        />
        No fill (outline only)
      </label>
      <ColorField label="Fill" value={settings.fill} onChange={(c) => onChange({ fill: c, fillEnabled: true })} disabled={!settings.fillEnabled} />
      <ColorField label="Outline" value={settings.stroke} onChange={(c) => onChange({ stroke: c })} />
      <SliderField label="Outline width" value={settings.strokeWidth} min={0} max={24} unit="px" onChange={(v) => onChange({ strokeWidth: v })} />
    </Section>
  );
}

function TextToolSettings({ settings, onChange }: { settings: ToolSettings; onChange: (p: Partial<ToolSettings>) => void }) {
  return (
    <Section title="Text style">
      <FontSelect value={settings.fontFamily} onChange={(f) => onChange({ fontFamily: f })} />
      <ColorField label="Color" value={settings.fontColor} onChange={(c) => onChange({ fontColor: c })} />
      <p className="flex gap-1.5 text-xs text-neutral-600 leading-snug">
        <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
        Font size follows the height of the box you drag. You can change it afterwards with the Select tool.
      </p>
    </Section>
  );
}

/* ---------- Editing the selected object ---------- */

function ObjectProperties({
  obj,
  canvas,
  onChange,
  onDelete,
}: {
  obj: fabric.Object;
  canvas: fabric.Canvas;
  onChange: () => void;
  onDelete: () => void;
}) {
  const o = obj as any;
  const text = isTextObject(obj);
  const isImage = obj.type === 'image';
  const isPath = obj.type === 'path';
  const isTextbox = obj.type === 'textbox';

  const apply = (patch: Record<string, any>) => {
    obj.set(patch as any);
    obj.setCoords();
    obj.dirty = true;
    canvas.requestRenderAll();
    onChange();
  };

  const setFontSize = (v: number) => apply({ fontSize: v, originalFontSize: v });

  const setFontFamily = (family: string) => {
    if (fabric.util?.clearFabricFontCache) fabric.util.clearFabricFontCache();
    obj.set('fontFamily' as any, family);
    o.initDimensions?.();
    apply({});
  };

  const setWidth = (w: number) => {
    if (isTextbox) apply({ width: Math.max(20, w) });
    else apply({ scaleX: Math.max(1, w) / (obj.width || 1) });
  };
  const setHeight = (h: number) => apply({ scaleY: Math.max(1, h) / (obj.height || 1) });

  const noFill = !o.fill || o.fill === 'transparent';
  const duplicate = () => {
    obj.clone((cloned: fabric.Object) => {
      cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      onChange();
    });
  };

  return (
    <>
      {text && (
        <Section title="Text">
          <FontSelect value={o.fontFamily || 'Arial'} onChange={setFontFamily} />
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Size" value={o.fontSize || 20} min={6} max={400} onChange={setFontSize} />
            <div>
              <FieldLabel>Style</FieldLabel>
              <div className="flex gap-1.5">
                <ToggleButton
                  pressed={o.fontWeight === 'bold'}
                  onClick={() => apply({ fontWeight: o.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  title="Bold"
                  className="flex-1"
                >
                  <Bold className="w-4 h-4" />
                </ToggleButton>
                <ToggleButton
                  pressed={o.fontStyle === 'italic'}
                  onClick={() => apply({ fontStyle: o.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  title="Italic"
                  className="flex-1"
                >
                  <Italic className="w-4 h-4" />
                </ToggleButton>
              </div>
            </div>
          </div>
          <div>
            <FieldLabel>Alignment</FieldLabel>
            <div className="grid grid-cols-3 gap-1.5">
              {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([align, Icon]) => (
                <ToggleButton key={align} pressed={(o.textAlign || 'left') === align} onClick={() => apply({ textAlign: align })} title={`Align ${align}`}>
                  <Icon className="w-4 h-4" />
                </ToggleButton>
              ))}
            </div>
          </div>
        </Section>
      )}

      {!isImage && (
        <Section title="Appearance">
          {!isPath && (
            <>
              {!text && (
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noFill}
                    onChange={(e) => apply({ fill: e.target.checked ? 'transparent' : '#97f0e5' })}
                    className="w-4 h-4 accent-black"
                  />
                  No fill (outline only)
                </label>
              )}
              <ColorField
                label={text ? 'Text color' : 'Fill'}
                value={toHex(o.fill, '#000000')}
                onChange={(c) => apply({ fill: c })}
                disabled={!text && noFill}
              />
            </>
          )}
          {!text && (
            <>
              <ColorField label={isPath ? 'Stroke color' : 'Outline'} value={toHex(o.stroke, '#000000')} onChange={(c) => apply({ stroke: c })} />
              <SliderField label={isPath ? 'Stroke width' : 'Outline width'} value={o.strokeWidth ?? 0} min={0} max={60} unit="px" onChange={(v) => apply({ strokeWidth: v })} />
            </>
          )}
          <SliderField label="Opacity" value={Math.round((o.opacity ?? 1) * 100)} min={0} max={100} unit="%" onChange={(v) => apply({ opacity: v / 100 })} />
        </Section>
      )}

      {isImage && (
        <Section title="Appearance">
          <SliderField label="Opacity" value={Math.round((o.opacity ?? 1) * 100)} min={0} max={100} unit="%" onChange={(v) => apply({ opacity: v / 100 })} />
        </Section>
      )}

      <Section title="Position & size">
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="X" value={Math.round(obj.left || 0)} onChange={(v) => apply({ left: v })} />
          <NumberField label="Y" value={Math.round(obj.top || 0)} onChange={(v) => apply({ top: v })} />
          <NumberField label="Width" value={Math.round(obj.getScaledWidth())} min={1} onChange={setWidth} />
          {!isTextbox && <NumberField label="Height" value={Math.round(obj.getScaledHeight())} min={1} onChange={setHeight} />}
        </div>
        <SliderField label="Rotation" value={Math.round(obj.angle || 0)} min={-180} max={180} unit="°" onChange={(v) => apply({ angle: v })} />
      </Section>

      <Section title="Arrange">
        <div className="grid grid-cols-4 gap-1.5">
          <ToggleButton pressed={false} title="Bring to front" onClick={() => { canvas.bringToFront(obj); canvas.requestRenderAll(); onChange(); }}>
            <BringToFront className="w-4 h-4" />
          </ToggleButton>
          <ToggleButton pressed={false} title="Send to back" onClick={() => { canvas.sendToBack(obj); canvas.requestRenderAll(); onChange(); }}>
            <SendToBack className="w-4 h-4" />
          </ToggleButton>
          <ToggleButton pressed={false} title="Duplicate" onClick={duplicate}>
            <Copy className="w-4 h-4" />
          </ToggleButton>
          <ToggleButton
            pressed={false}
            title="Delete (Del)"
            className="hover:!bg-red-500 hover:!text-white"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </ToggleButton>
        </div>
      </Section>
    </>
  );
}

/* ---------- Canvas-level settings (nothing selected) ---------- */

function CanvasSettings({
  canvas,
  onSetBackgroundColor,
  onChange,
  onExport,
}: {
  canvas: fabric.Canvas | null;
  onSetBackgroundColor: (c: string) => void;
  onChange: () => void;
  onExport?: (format: 'json' | 'svg' | 'png') => any;
}) {
  const handleExport = (format: 'json' | 'svg' | 'png') => {
    if (!canvas || !onExport) return;
    const data = onExport(format);
    const link = document.createElement('a');
    link.download = `grafi-ai-design.${format}`;
    if (format === 'png') {
      link.href = data;
      link.click();
      return;
    }
    const blob = new Blob([data], { type: format === 'svg' ? 'image/svg+xml' : 'application/json' });
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        canvas.loadFromJSON(JSON.parse(e.target?.result as string), () => canvas.renderAll());
      } catch (error) {
        console.error('Failed to load design:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <>
      <Section title="Canvas">
        <ColorField
          label="Background"
          value={toHex(canvas?.backgroundColor, '#ffffff')}
          onChange={(c) => { onSetBackgroundColor(c); onChange(); }}
        />
      </Section>
      <Section title="Export & import">
        <div className="grid grid-cols-3 gap-1.5">
          {(['png', 'svg', 'json'] as const).map((format) => (
            <button key={format} onClick={() => handleExport(format)} className="retro-button !px-2 !py-2 flex items-center justify-center gap-1 text-xs font-bold uppercase">
              <Download className="w-3.5 h-3.5" />
              {format}
            </button>
          ))}
        </div>
        <label className="retro-button !py-2 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer">
          <Upload className="w-3.5 h-3.5" />
          Import design (JSON)
          <input type="file" accept=".json,application/json" onChange={handleImport} className="hidden" />
        </label>
      </Section>
    </>
  );
}

/* ---------- Image tool ---------- */

function ImageSettings({ onAddImage, onOpenAI }: { onAddImage?: (url: string) => void; onOpenAI?: () => void }) {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('That file is not an image.');
    if (file.size > 10 * 1024 * 1024) return setError('That image is larger than 10MB.');
    setError(null);
    onAddImage?.(URL.createObjectURL(file));
  };

  const handleUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) return setError('Enter a full link starting with http:// or https://');
    setError(null);
    onAddImage?.(url);
    setImageUrl('');
  };

  return (
    <Section title="Add an image">
      <label className="flex flex-col items-center justify-center gap-1.5 py-6 border-2 border-dashed border-black rounded cursor-pointer bg-white hover:bg-[var(--retro-accent)]/50 transition-colors text-center">
        <Upload className="w-5 h-5" />
        <span className="text-xs font-bold">Choose a file</span>
        <span className="text-[11px] text-neutral-600">JPG, PNG, GIF or WebP, up to 10MB</span>
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </label>

      <div>
        <FieldLabel htmlFor="image-url">Or paste a link</FieldLabel>
        <div className="flex gap-1.5">
          <div className="relative flex-1 min-w-0">
            <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              id="image-url"
              type="url"
              placeholder="https://…"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrl()}
              className="field !pl-7"
            />
          </div>
          <button onClick={handleUrl} disabled={!imageUrl.trim()} className="retro-button !px-3 !py-1 text-xs font-bold">
            Add
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}

      {onOpenAI && (
        <button
          onClick={onOpenAI}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[var(--pop-pink)] border-2 border-black rounded shadow-[2px_2px_0_#000] text-xs font-bold hover:-translate-y-px transition-transform"
        >
          <Wand2 className="w-3.5 h-3.5" />
          Or generate one with AI
        </button>
      )}
    </Section>
  );
}

/* ---------- The panel ---------- */

export default function PropertyPanel({
  canvas,
  selectedObjects,
  activeTool,
  onSelectTool,
  toolSettings,
  onToolSettingsChange,
  onChange,
  onSetBackgroundColor,
  onDeleteSelected,
  onExport,
  onAddImage,
  onOpenAI,
  activeAIPanel = null,
  onCloseAIPanel,
  onLoad,
  onWalrusActionRef,
  onRefreshDesigns,
}: PropertyPanelProps) {
  const currentAccount = useCurrentAccount();
  const address = currentAccount?.address || null;

  const [tab, setTab] = useState<'properties' | 'designs'>('properties');
  const [showWalrusPopup, setShowWalrusPopup] = useState(false);
  const [walrusPopupMode, setWalrusPopupMode] = useState<'save' | 'load'>('save');
  const [designsRefreshTrigger, setDesignsRefreshTrigger] = useState(0);

  const { loadDesignToCanvas, deleteDesign, refreshDesigns } = useMongoDBDesigns();

  useEffect(() => {
    if (address) refreshDesigns(address);
  }, [address, refreshDesigns]);

  // Picking a tool (or opening AI) always brings the matching settings into view
  useEffect(() => {
    setTab('properties');
  }, [activeTool, activeAIPanel]);

  // Let the toolbox open the Walrus save/load popup
  useEffect(() => {
    if (onWalrusActionRef) {
      onWalrusActionRef.current = (action) => {
        setWalrusPopupMode(action);
        setShowWalrusPopup(true);
      };
    }
  }, [onWalrusActionRef]);

  // Keep the numbers in the panel in step with dragging/resizing on the canvas
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    if (!canvas) return;
    const handler = () => onChangeRef.current();
    canvas.on('object:modified', handler);
    canvas.on('text:changed', handler);
    return () => {
      canvas.off('object:modified', handler);
      canvas.off('text:changed', handler);
    };
  }, [canvas]);

  const handleLoadMongoDBDesign = useCallback(async (designId: string) => {
    if (!canvas) return;
    try {
      await loadDesignToCanvas(designId, canvas);
    } catch (error) {
      console.error('Failed to load design from MongoDB:', error);
    }
  }, [canvas, loadDesignToCanvas]);

  const handleDeleteMongoDBDesign = useCallback(async (designId: string) => {
    try {
      await deleteDesign(designId);
    } catch (error) {
      console.error('Failed to delete design from MongoDB:', error);
    }
  }, [deleteDesign]);

  const handleRefreshDesigns = useCallback(() => {
    setDesignsRefreshTrigger((prev) => prev + 1);
    onRefreshDesigns?.();
  }, [onRefreshDesigns]);

  const openWalrus = (mode: 'save' | 'load') => {
    setWalrusPopupMode(mode);
    setShowWalrusPopup(true);
  };

  /* --- what to show on the Properties tab --- */
  const selectionCount = selectedObjects.length;
  const single = selectionCount === 1 ? selectedObjects[0] : null;
  const drawingTool = activeTool !== 'select' && activeTool !== 'image';

  const renderProperties = () => {
    if (activeTool === 'select') {
      if (single && canvas) {
        const Icon = objectIcon(single);
        return (
          <>
            <PanelHeader icon={Icon} title={`${objectLabel(single)} selected`} hint="Changes apply straight away." />
            <ObjectProperties obj={single} canvas={canvas} onChange={onChange} onDelete={onDeleteSelected} />
          </>
        );
      }
      if (selectionCount > 1) {
        return (
          <>
            <PanelHeader icon={MousePointer2} title={`${selectionCount} objects selected`} hint="Drag to move them together." />
            <Section title="Selection">
              <SliderField
                label="Opacity"
                value={Math.round((selectedObjects[0].opacity ?? 1) * 100)}
                min={0}
                max={100}
                unit="%"
                onChange={(v) => {
                  selectedObjects.forEach((o) => { o.set('opacity', v / 100); o.dirty = true; });
                  canvas?.requestRenderAll();
                  onChange();
                }}
              />
              <button onClick={onDeleteSelected} className="retro-button w-full !py-2 flex items-center justify-center gap-2 text-xs font-bold hover:!bg-red-500 hover:!text-white">
                <Trash2 className="w-3.5 h-3.5" />
                Delete {selectionCount} objects
              </button>
            </Section>
          </>
        );
      }
      return (
        <>
          <PanelHeader icon={MousePointer2} title="Select" hint="Click an object on the canvas to edit it. Pick a tool on the left to start drawing." />
          <CanvasSettings canvas={canvas} onSetBackgroundColor={onSetBackgroundColor} onChange={onChange} onExport={onExport} />
        </>
      );
    }

    const info = TOOL_INFO[activeTool];
    return (
      <>
        <PanelHeader icon={info.icon} title={info.title} hint={info.hint} />

        {drawingTool && selectionCount > 0 && (
          <div className="mx-4 mt-3 p-2.5 flex items-start gap-2 bg-[var(--pop-yellow)]/40 border-2 border-black rounded text-xs">
            <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
            <span className="flex-1">
              These settings are for new drawings.{' '}
              <button onClick={() => onSelectTool('select')} className="font-bold underline underline-offset-2">
                Edit the selected {selectionCount === 1 ? objectLabel(selectedObjects[0]).toLowerCase() : 'objects'}
              </button>
            </span>
          </div>
        )}

        {activeTool === 'pencil' && <BrushSettings settings={toolSettings} onChange={onToolSettingsChange} />}
        {(activeTool === 'rectangle' || activeTool === 'circle') && (
          <ShapeSettings tool={activeTool} settings={toolSettings} onChange={onToolSettingsChange} />
        )}
        {activeTool === 'text' && <TextToolSettings settings={toolSettings} onChange={onToolSettingsChange} />}
        {activeTool === 'image' && <ImageSettings onAddImage={onAddImage} onOpenAI={onOpenAI} />}
      </>
    );
  };

  const renderDesigns = () => (
    <div className="flex flex-col min-h-full">
      <Section title="Walrus storage">
        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={() => openWalrus('save')} className="retro-button !py-2 flex items-center justify-center gap-1.5 text-xs font-bold">
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
          <button onClick={() => openWalrus('load')} className="retro-button !py-2 flex items-center justify-center gap-1.5 text-xs font-bold">
            <FolderOpen className="w-3.5 h-3.5" />
            Load
          </button>
        </div>
        <p className="text-[11px] text-neutral-600 leading-snug">Designs are encrypted and stored on Walrus, tied to your wallet.</p>
      </Section>
      <div className="flex-1 min-h-0">
        <DesignsList
          walletAddress={address}
          onLoadDesign={handleLoadMongoDBDesign}
          onDeleteDesign={handleDeleteMongoDBDesign}
          refreshTrigger={designsRefreshTrigger}
        />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col w-full min-w-0 max-w-full">
      {/* Tabs */}
      <div role="tablist" className="flex flex-none border-b-2 border-black">
        {([['properties', 'Properties'], ['designs', 'My Designs']] as const).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 px-3 py-3 text-xs font-bold uppercase tracking-wide transition-colors',
              id === 'designs' && 'border-l-2 border-black',
              tab === id ? 'bg-white' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-100'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto w-full min-w-0 max-w-full" role="tabpanel">
        {showWalrusPopup ? (
          <div className="h-full w-full min-w-0 max-w-full">
            <WalrusPopup
              isOpen={showWalrusPopup}
              onClose={() => setShowWalrusPopup(false)}
              canvas={canvas}
              onLoad={onLoad}
              onSave={handleRefreshDesigns}
              mode={walrusPopupMode}
            />
          </div>
        ) : tab === 'designs' ? (
          renderDesigns()
        ) : activeAIPanel === 'image' ? (
          <div className="h-full w-full">
            <PanelHeader
              icon={Wand2}
              title="AI Image"
              hint="Describe what you want and add it to the canvas."
              action={
                <button onClick={onCloseAIPanel} className="p-1 rounded hover:bg-black/10" aria-label="Close AI Image">
                  <X className="w-4 h-4" />
                </button>
              }
            />
            <div className="w-full overflow-hidden">
              <AIImageModal isOpen onClose={onCloseAIPanel || (() => {})} canvas={canvas} embedded />
            </div>
          </div>
        ) : (
          renderProperties()
        )}
      </div>
    </div>
  );
}
