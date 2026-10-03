'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Wand2,
  ShieldCheck,
  HardDrive,
  Wallet,
  Layers,
  ArrowRight,
  MousePointerClick,
  Lock,
  CloudUpload,
} from 'lucide-react';
import Logo from '@/components/UI/Logo';
import ConnectWalletButton from '@/components/Wallet/ConnectWalletButton';

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI image generation',
    body: 'Describe it and get a ready-to-use image on your canvas in seconds, powered by Stable Diffusion XL.',
    color: 'var(--pop-pink)',
  },
  {
    icon: Sparkles,
    title: 'AI copy & suggestions',
    body: 'Generate headlines, rewrite text and get design suggestions based on what is on your canvas.',
    color: 'var(--pop-yellow)',
  },
  {
    icon: ShieldCheck,
    title: 'Encrypted with Seal',
    body: 'Designs are encrypted before they leave your browser. Only wallets you allow can decrypt them.',
    color: 'var(--retro-accent)',
  },
  {
    icon: HardDrive,
    title: 'Stored on Walrus',
    body: 'Your work lives on decentralized storage, not on a server that can disappear or lock you out.',
    color: 'var(--pop-blue)',
  },
  {
    icon: Wallet,
    title: 'Your wallet is your login',
    body: 'No accounts or passwords. Connect a Sui wallet and your designs are tied to your address.',
    color: 'var(--pop-yellow)',
  },
  {
    icon: Layers,
    title: 'A real design editor',
    body: 'Layers, shapes, freehand drawing, fonts, colors and PNG export, all in a fast canvas editor.',
    color: 'var(--pop-pink)',
  },
];

const STEPS = [
  {
    icon: MousePointerClick,
    title: 'Connect your wallet',
    body: 'Use Slush or any Sui wallet. It only signs requests, and we never see your keys.',
  },
  {
    icon: Sparkles,
    title: 'Create with AI',
    body: 'Drop in shapes and text, or ask the AI for images and copy. Tweak everything on the canvas.',
  },
  {
    icon: Lock,
    title: 'Encrypt and save',
    body: 'Save to Walrus with Seal encryption, then reopen your designs from any device.',
  },
];

const MARQUEE = ['Sui', 'Walrus', 'Seal', 'Stable Diffusion XL', 'Groq', 'Slush Wallet', 'MongoDB'];

const PROMPTS = [
  'a retro poster of a walrus surfing',
  'neon logo for a coffee shop called Moon Bean',
  'minimal album cover, mint green and ink',
  'birthday invite with pixel-art balloons',
  'a cozy cabin in the woods, flat illustration',
  'bold headline: Launch day is here',
];

/** Types each phrase, pauses, backspaces it, then moves on to the next one. */
function useTypewriter(phrases: string[]) {
  // Start on the full first phrase so server and client markup match.
  const [state, setState] = useState({ index: 0, text: phrases[0], deleting: false });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const full = phrases[state.index];
    let delay: number;
    let next: typeof state;

    if (!state.deleting && state.text === full) {
      delay = 1800; // hold the finished phrase
      next = { ...state, deleting: true };
    } else if (state.deleting && state.text === '') {
      delay = 350; // short beat before the next phrase
      next = { index: (state.index + 1) % phrases.length, text: '', deleting: false };
    } else if (state.deleting) {
      delay = 25;
      next = { ...state, text: state.text.slice(0, -1) };
    } else {
      delay = 55 + Math.random() * 55; // uneven keystrokes feel human
      next = { ...state, text: full.slice(0, state.text.length + 1) };
    }

    const id = window.setTimeout(() => setState(next), delay);
    return () => window.clearTimeout(id);
  }, [state, phrases]);

  return state.text;
}

function HeroMockup() {
  const typed = useTypewriter(PROMPTS);
  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-hidden="true">
      {/* floating stickers */}
      <div
        className="absolute -top-5 -right-3 z-10 px-3 py-1.5 bg-[var(--pop-yellow)] border-2 border-black rounded-md text-xs font-bold shadow-[3px_3px_0_#000] animate-float"
        style={{ ['--r' as string]: '6deg' }}
      >
        AI generated
      </div>
      <div
        className="absolute -bottom-9 left-6 z-10 px-3 py-1.5 bg-[var(--pop-pink)] border-2 border-black rounded-md text-xs font-bold shadow-[3px_3px_0_#000] animate-float"
        style={{ ['--r' as string]: '-5deg', animationDelay: '1s' }}
      >
        Encrypted on Walrus
      </div>

      <div className="bg-white border-2 border-black rounded-xl shadow-[8px_8px_0_#000] overflow-hidden">
        {/* window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-black">
          <span className="w-3 h-3 rounded-full bg-[var(--pop-pink)]" />
          <span className="w-3 h-3 rounded-full bg-[var(--pop-yellow)]" />
          <span className="w-3 h-3 rounded-full bg-[var(--retro-accent)]" />
          <span className="ml-3 text-xs text-white/70 font-medium">poster.grafi</span>
        </div>

        {/* canvas */}
        <div className="relative h-[300px] dot-grid bg-[#fbfbf7]">
          <div className="absolute left-8 top-8 w-28 h-28 rounded-full bg-[var(--pop-pink)] border-2 border-black shadow-[4px_4px_0_#000]" />
          <div className="absolute right-10 top-14 w-32 h-24 rotate-6 bg-[var(--pop-yellow)] border-2 border-black shadow-[4px_4px_0_#000]" />
          <div className="absolute left-16 bottom-16 w-40 h-16 -rotate-3 bg-[var(--retro-accent)] border-2 border-black shadow-[4px_4px_0_#000] flex items-center justify-center">
            <span className="font-display font-bold text-2xl tracking-tight">GRAFI</span>
          </div>
          <div className="absolute right-14 bottom-14 w-14 h-14 rounded-full bg-[var(--pop-blue)] border-2 border-black" />

          {/* selection box */}
          <div className="absolute left-[3.4rem] bottom-[3.4rem] w-[11.4rem] h-[5rem] -rotate-3 border-2 border-dashed border-[var(--pop-blue)]" />
        </div>

        {/* prompt bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-t-2 border-black bg-white">
          <Wand2 className="w-4 h-4 shrink-0" />
          <span className="text-sm text-neutral-700 truncate">
            {typed}<span className="animate-blink">|</span>
          </span>
          <span className="ml-auto text-xs font-bold px-2 py-1 bg-black text-white rounded">Generate</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden text-black">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-[var(--retro-accent)]/90 backdrop-blur border-b-2 border-black">
        <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between" aria-label="Main">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#features" className="hover:underline underline-offset-4">Features</a>
            <a href="#how-it-works" className="hover:underline underline-offset-4">How it works</a>
          </div>
          <ConnectWalletButton />
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-5 pt-14 pb-20 md:pt-20 md:pb-28 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-full text-xs font-bold shadow-[2px_2px_0_#000]">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Live on Sui testnet
            </span>
            <h1 className="mt-6 font-display font-bold text-5xl sm:text-6xl leading-[1.05] tracking-tight text-balance">
              Design with AI.
              <br />
              <span className="inline-block bg-black text-[var(--retro-accent)] px-3 py-1 -rotate-1 mt-3 whitespace-nowrap">
                Own every pixel.
              </span>
            </h1>
            <p className="mt-7 text-lg sm:text-xl text-neutral-800 max-w-xl leading-relaxed">
              Grafi AI is a design studio where AI helps you create, Seal encrypts your work, and Walrus stores it.
              Connect your wallet and start designing.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ConnectWalletButton size="lg" text="Connect wallet to start" />
              <a href="#how-it-works" className="btn-outline h-14 px-6 text-base">
                See how it works <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <p className="mt-5 text-sm text-neutral-700">
              No sign-up. Works with Slush and other Sui wallets. Your keys never leave your wallet.
            </p>
          </div>

          <HeroMockup />
        </section>

        {/* Marquee */}
        <div className="bg-black text-white border-y-2 border-black overflow-hidden" aria-hidden="true">
          <div className="flex w-max animate-marquee py-4">
            {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={i} className="flex items-center font-display font-bold text-lg px-6 whitespace-nowrap">
                {item}
                <span className="ml-12 text-[var(--retro-accent)]">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <section id="features" className="bg-white border-b-2 border-black scroll-mt-16">
          <div className="max-w-6xl mx-auto px-5 py-20 md:py-24">
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight max-w-2xl">
              Everything you need to create, nothing you have to trust.
            </h2>
            <p className="mt-4 text-lg text-neutral-700 max-w-2xl">
              Grafi AI pairs a fast editor with AI tools and decentralized, encrypted storage.
            </p>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, body, color }) => (
                <article
                  key={title}
                  className="group bg-white border-2 border-black rounded-xl p-6 shadow-[5px_5px_0_#000] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0_#000]"
                >
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]"
                    style={{ background: color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 font-display font-bold text-xl">{title}</h3>
                  <p className="mt-2 text-neutral-700 leading-relaxed">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16">
          <div className="max-w-6xl mx-auto px-5 py-20 md:py-24">
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">How it works</h2>
            <ol className="mt-12 grid md:grid-cols-3 gap-6">
              {STEPS.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="relative bg-white border-2 border-black rounded-xl p-6 pt-10 shadow-[5px_5px_0_#000]">
                  <span className="absolute -top-5 left-6 w-10 h-10 rounded-full bg-black text-[var(--retro-accent)] font-display font-bold text-lg flex items-center justify-center border-2 border-black">
                    {i + 1}
                  </span>
                  <Icon className="w-7 h-7" />
                  <h3 className="mt-4 font-display font-bold text-xl">{title}</h3>
                  <p className="mt-2 text-neutral-700 leading-relaxed">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 pb-20 md:pb-24">
          <div className="max-w-4xl mx-auto bg-black text-white rounded-2xl border-2 border-black shadow-[8px_8px_0_var(--pop-pink)] px-8 py-14 text-center">
            <CloudUpload className="w-10 h-10 mx-auto text-[var(--retro-accent)]" />
            <h2 className="mt-5 font-display font-bold text-3xl md:text-5xl tracking-tight text-balance">
              Ready to make something that&apos;s actually yours?
            </h2>
            <p className="mt-4 text-white/75 text-lg max-w-xl mx-auto">
              Connect your wallet and open the studio. It takes a few seconds.
            </p>
            <div className="mt-8 flex justify-center">
              <ConnectWalletButton size="lg" variant="outline" text="Connect wallet" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-black bg-white">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <Logo size="sm" />
          <p className="text-neutral-600">Built on Sui, Walrus and Seal. Running on testnet.</p>
        </div>
      </footer>
    </div>
  );
}
