import React from 'react';
import Logo from './Logo';

export default function Splash({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" role="status" aria-live="polite">
      <div className="retro-panel px-10 py-8 flex flex-col items-center gap-5 bg-white">
        <div className="animate-float">
          <Logo size="lg" />
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-[var(--retro-text)]">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
          {label}
        </div>
      </div>
    </div>
  );
}
