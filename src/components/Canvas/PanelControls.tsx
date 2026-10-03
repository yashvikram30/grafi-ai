'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/helpers';

const QUICK_COLORS = [
  '#000000', '#ffffff', '#ed1c24', '#ff7f27', '#fff200', '#22b14c',
  '#00a2e8', '#3f48cc', '#a349a4', '#97f0e5', '#ff90e8', '#7f7f7f',
];

const HEX = /^#[0-9a-f]{6}$/i;
export const toHex = (value: unknown, fallback = '#000000') =>
  typeof value === 'string' && HEX.test(value) ? value.toLowerCase() : fallback;

export function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('px-4 py-3 border-b-2 border-black/10', className)}>
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2.5">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-neutral-800 mb-1">
      {children}
    </label>
  );
}

export function ColorField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}) {
  const hex = toHex(value);
  const [draft, setDraft] = useState(hex);
  useEffect(() => setDraft(hex), [hex]);

  const commit = () => {
    const next = draft.startsWith('#') ? draft : `#${draft}`;
    if (HEX.test(next)) onChange(next.toLowerCase());
    else setDraft(hex);
  };

  return (
    <div className={cn(disabled && 'opacity-40 pointer-events-none')}>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <label
          className="relative w-9 h-9 shrink-0 border-2 border-black rounded cursor-pointer shadow-[2px_2px_0_#000] overflow-hidden"
          style={{ backgroundColor: hex }}
          title="Pick a color"
        >
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label={`${label} picker`}
          />
        </label>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          className="field font-mono uppercase"
          maxLength={7}
          spellCheck={false}
          aria-label={`${label} hex value`}
        />
      </div>
      <div className="grid grid-cols-12 gap-[3px] mt-2">
        {QUICK_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={cn('paint-swatch', hex === c && 'ring-2 ring-offset-1 ring-black')}
            style={{ backgroundColor: c }}
            title={c}
            aria-label={`${label}: ${c}`}
          />
        ))}
      </div>
    </div>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-xs font-mono font-bold tabular-nums">
          {Math.round(value * 100) / 100}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-black cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}

/** Number input that lets you type freely and only applies valid numbers. */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const shown = String(Math.round(value * 100) / 100);
  const [draft, setDraft] = useState(shown);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(shown);
  }, [shown, focused]);

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        value={focused ? draft : shown}
        min={min}
        max={max}
        step={step}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setDraft(shown);
        }}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = parseFloat(e.target.value);
          if (!Number.isNaN(n)) onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n)));
        }}
        className="field"
        aria-label={label}
      />
    </div>
  );
}

export function ToggleButton({
  pressed,
  onClick,
  title,
  children,
  className,
}: {
  pressed: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={pressed}
      title={title}
      aria-label={title}
      className={cn('paint-tool !aspect-auto h-9', className)}
    >
      {children}
    </button>
  );
}
