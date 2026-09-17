"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Sliders,
  FileDown,
  Layers,
  ShieldCheck,
  ChevronRight,
  Eye,
  GripVertical,
  Laptop,
  Database,
  Cpu,
  Star,
  Check,
} from "lucide-react";

const templateCards = [
  {
    id: "modern-tech",
    title: "Modern Tech / Minimalist",
    tag: "MOST POPULAR",
    badgeColor: "text-sky-400 bg-sky-500/15 border-sky-500/25",
    description: "Streamlined single-column design with tech stack pill tags, crisp company markers, and metric-focused bullet points.",
    idealFor: "Software Engineers, Product Managers, Data Scientists, CTOs",
  },
  {
    id: "executive",
    title: "Executive Classic",
    tag: "BOARDROOM READY",
    badgeColor: "text-amber-400 bg-amber-500/15 border-amber-500/25",
    description: "Authoritative serif typography, dual horizontal divider rules, and prominent executive summary designed for leadership impact.",
    idealFor: "VPs, Directors, Finance, Strategy, Consulting, Legal",
  },
  {
    id: "creative",
    title: "Creative Grid & Banner",
    tag: "STANDOUT DESIGN",
    badgeColor: "text-pink-400 bg-pink-500/15 border-pink-500/25",
    description: "Dynamic top accent banner, portfolio showcase cards, optional avatar integration, and modern skill badges.",
    idealFor: "UI/UX Designers, Art Directors, Marketers, Creative Founders",
  },
  {
    id: "sidebar",
    title: "Compact Sidebar",
    tag: "MAXIMUM DENSITY",
    badgeColor: "text-teal-400 bg-teal-500/15 border-teal-500/25",
    description: "Structured 2-column layout with left sidebar for skills, photo, and education; right column for career trajectory.",
    idealFor: "Full-Stack Devs, Architects, Specialists with wide skillsets",
  },
  {
    id: "ats-classic",
    title: "Harvard / 100% ATS",
    tag: "ZERO PARSER FAILS",
    badgeColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/25",
    description: "Pure ATS-optimized hierarchy engineered for Taleo, Workday, and Greenhouse. Guaranteed 100% readability.",
    idealFor: "Fortune 500 applications, Government, Academic, High-Volume hiring",
  },
];

export default function LandingPage() {
  const [activeTemplatePreview, setActiveTemplatePreview] = useState("modern-tech");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden flex flex-col">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-sky-500/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[700px] right-0 w-[550px] h-[550px] bg-indigo-500/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[1400px] left-0 w-[550px] h-[550px] bg-emerald-500/10 blur-[130px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              CVForge
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              Fintech-Grade Resume Architecture
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
          <a href="#templates" className="hover:text-white transition-colors">
            5 Templates
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#monetization" className="hover:text-white transition-colors">
            Pricing & Pro
          </a>
          <a href="#why-cvforge" className="hover:text-white transition-colors">
            Why CVForge
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-bold transition-all shadow-md shadow-sky-500/20"
          >
            <span>Open App</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto w-full flex flex-col items-center text-center relative">
        {/* Fintech Pulse Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-300 mb-8 shadow-sm backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold">New Release:</span>
          <span>5 Industry-Standard Templates + Instant SQLite Autosave</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.15]">
          Most CV builders are dull.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-indigo-400">
            We built the high-impact resume engine.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mt-6 leading-relaxed">
          Fluid drag-and-drop section arrangement, live split-screen preview, five battle-tested executive templates, and zero data loss autosave. Download pristine vector PDFs in seconds.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <Link
            href="/app"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-sky-500/25 active:scale-95 transition-all"
          >
            <span>Open App & Build Free</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>

          <a
            href="#templates"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all"
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>View 5 Template Styles</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No Account Mandatory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Data Loss Autosave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% ATS Parsable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Pixel-Perfect Vector PDF</span>
          </div>
        </div>

        {/* Interactive App Preview Window Mockup */}
        <div className="mt-14 w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-3 shadow-2xl shadow-sky-500/10">
          <div className="rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex flex-col">
            {/* Window Titlebar */}
            <div className="h-10 bg-slate-900/80 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">cvforge.app/editor/live</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Autosaved just now</span>
              </div>
            </div>

            {/* Split Screen Mockup Teaser */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[360px] text-left">
              {/* Left Column: Form Controls */}
              <div className="md:col-span-5 p-5 border-r border-slate-800/80 bg-slate-950/60 space-y-3 hidden md:block">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
                  <span>Sections (Drag & Reorder)</span>
                  <span className="text-sky-400 font-mono text-[10px]">6 SECTIONS</span>
                </div>
                {["Personal Info", "Summary", "Experience", "Skills & Tech", "Education", "Projects"].map(
                  (sec, i) => (
                    <div
                      key={sec}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-3.5 h-3.5 text-slate-600" />
                        <span>{sec}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">#{i + 1}</span>
                    </div>
                  )
                )}
              </div>

              {/* Right Column: Live Rendered Sheet */}
              <div className="md:col-span-7 p-6 bg-slate-900/40 flex items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 text-slate-900 font-sans space-y-3 scale-95 border border-slate-200">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="text-lg font-black tracking-tight text-slate-900">
                        Alex Rivera
                      </h4>
                      <p className="text-xs font-bold text-sky-600">
                        Senior Full-Stack Architect
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">
                      AR
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-2">
                    High-impact engineer with 8+ years architecting resilient distributed systems and scaling microservices from 0 to 15M+ active users.
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Experience
                    </div>
                    <div className="text-[11px] font-bold text-slate-900">
                      Staff Engineer • AetherScale
                    </div>
                    <div className="text-[10px] text-slate-500">
                      2022 – Present • San Francisco, CA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Templates Showcase Section */}
      <section id="templates" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-2">
            Industry-Standard Design
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            5 Curated Styles. Zero Generic Clutter.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-3">
            Every template is meticulously calibrated for typography, white-space balance, and applicant tracking system (ATS) parsability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templateCards.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tmpl.badgeColor}`}
                  >
                    {tmpl.tag}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                  {tmpl.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {tmpl.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px]">
                  <span className="font-bold text-slate-300">Best for: </span>
                  <span className="text-slate-400">{tmpl.idealFor}</span>
                </div>
              </div>

              <div className="pt-5 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  href="/app"
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors"
                >
                  <span>Build with this style</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {/* New Templates Coming Soon Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-indigo-950/40 border border-indigo-500/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO ROADMAP
              </span>
              <h4 className="text-lg font-bold text-white mt-4 mb-2">
                Specialized Niche Styles
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Academic CVs, Medical Fellowships, European Europass 2.0, and LaTeX-inspired minimalist templates releasing bi-weekly for Pro subscribers.
              </p>
            </div>
            <div className="pt-5 mt-6 border-t border-indigo-500/20 text-xs font-bold text-indigo-300">
              Updated Every Month
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
            Engineered For Speed
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            Built Like Modern Devtools
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-3">
            Designed to feel as responsive and reliable as a code editor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">SQLite Autosave Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spend hours perfecting your CV with complete peace of mind. Every keystroke is debounced and persisted natively to local SQLite with cloud backup.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <GripVertical className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">Fluid Drag & Drop</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Move Skills above Experience for entry-level applications or put Projects at the top for technical interviews. Your CV re-renders immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <FileDown className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">Instant Vector PDF</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No server-side queues or pixelated screenshot renders. Export razor-sharp A4 or Letter vector PDFs straight from your browser.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">Live Design Palette</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adjust typography (Inter, Merriweather, Roboto Mono), color accents, line spacing, and density with instantaneous live visual feedback.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">One-Click Duplicate</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tailoring for multiple jobs? Clone any existing CV with 1 click, tweak the keywords for that specific job posting, and export.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-white">Anonymous or Named</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero mandatory login barriers. Start building right away as a guest, and save your work under a personalized profile whenever you choose.
            </p>
          </div>
        </div>
      </section>

      {/* Monetization / Pricing Section */}
      <section id="monetization" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-2">
            Transparent Monetization
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            Build Free. Upgrade For An Unfair Advantage.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-3">
            Free forever for everyday job hunters. Pro membership unlocks AI job-tailoring, cover letters, and all premium template drops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Starter Tier
              </span>
              <div className="text-3xl font-black text-white mt-2">$0</div>
              <p className="text-xs text-slate-400 mt-1">
                Perfect for quick CV creation and standard exports.
              </p>

              <div className="space-y-2.5 mt-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>2 Active CV Documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Harvard ATS & Modern Tech styles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Unlimited High-Res PDF Exports</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Local SQLite Autosave</span>
                </div>
              </div>
            </div>

            <Link
              href="/app"
              className="w-full mt-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white text-center transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Tier (Highlighted) */}
          <div className="p-7 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-sky-500 shadow-xl shadow-sky-500/10 flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black tracking-widest uppercase">
              RECOMMENDED
            </div>

            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Pro Member
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-white">$9</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                For active job seekers who want to land top offers.
              </p>

              <div className="space-y-2.5 mt-6 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400" />
                  <span className="font-bold">All 5+ Designer & Executive Styles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400" />
                  <span>AI Bullet Optimizer & Action Verbs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400" />
                  <span>Matched Cover Letter Generator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400" />
                  <span>Unlimited CV Duplicates & Versions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400" />
                  <span>Custom Web Portfolio Link</span>
                </div>
              </div>
            </div>

            <Link
              href="/app"
              className="w-full mt-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-black text-center transition-all shadow-md shadow-sky-500/20"
            >
              Get Pro Access
            </Link>
          </div>

          {/* 1-Day Pass Tier */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                24-Hour Sprint Pass
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-black text-white">$4.99</span>
                <span className="text-xs text-slate-400">one-time</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Applying to jobs this weekend? No subscription needed.
              </p>

              <div className="space-y-2.5 mt-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>24 hours full Pro template access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Unlimited PDF downloads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Auto-cancels automatically</span>
                </div>
              </div>
            </div>

            <Link
              href="/app"
              className="w-full mt-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white text-center transition-colors"
            >
              Get 24h Pass
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-sky-950/60 border border-sky-500/20 shadow-2xl relative overflow-hidden">
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Ready to build a CV that gets you interviews?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
            Jump in now, customize your experience, and download your CV in under 5 minutes.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-sky-500/20"
          >
            <span>Open App Now</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-slate-300">CVForge</span>
        </div>
        <p>© {new Date().getFullYear()} CVForge. All rights reserved. High-impact CV and Resume Platform.</p>
      </footer>
    </div>
  );
}
