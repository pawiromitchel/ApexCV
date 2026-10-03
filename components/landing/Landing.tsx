"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Eye,
  FileCheck2,
  FileUp,
  Github,
  Link2,
  MonitorSmartphone,
  Plus,
  ScanText,
} from "lucide-react";
import { initialResumeData } from "@/lib/sampleData";
import { fadeUp, stagger, spring } from "@/lib/motion";
import { ApexLogo } from "@/components/ui/ApexLogo";
import { buttonVariants } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const GITHUB_URL = "https://github.com/pawiromitchel/ApexCV";
import { TemplateThumbnail } from "@/components/preview/TemplateThumbnail";
import { TEMPLATES } from "@/components/editor/styling/ThemeToolbar";
import { HeroDemo } from "./HeroDemo";

const FEATURES = [
  { icon: <Eye />, title: "See every change live", body: "A true-to-print preview updates as you type. Click anything on the page to jump straight to its field." },
  { icon: <FileUp />, title: "Start from your old CV", body: "Upload a PDF and we fill in your experience, education, and skills for you to polish." },
  { icon: <FileCheck2 />, title: "Checks before you send", body: "Catches leftover sample text, missing contact details, vague bullets, and CVs that run too long." },
  { icon: <ScanText />, title: "Readable by humans and ATS", body: "Clean, single-flow layouts with real text, so applicant tracking systems can parse them." },
  { icon: <Link2 />, title: "Share a link, not an attachment", body: "Turn on a private link that always shows your latest version. Set it to expire or switch it off." },
  { icon: <MonitorSmartphone />, title: "Works everywhere", body: "Light and dark themes, phone-friendly editing, and installable as an app." },
];

const STEPS = [
  { title: "Pick a template", body: "Or import the CV you already have." },
  { title: "Fill in the sections", body: "Guided, one step at a time, with checks as you go." },
  { title: "Download or share", body: "Print-quality PDF in A4 or US Letter, or a live link." },
];

const FAQ = [
  {
    q: "Is it really free?",
    a: "Yes. Every template, the PDF export, and share links are free. There’s no watermark and no paid tier.",
  },
  {
    q: "Do I need an account?",
    a: "No. Your CVs are linked to this browser with a private key, so you can start straight away. Keep a PDF copy, because clearing your browser data disconnects you from them.",
  },
  {
    q: "Where is my data stored?",
    a: "On the ApexCV server, tied to that private browser key. Nobody else can open your CVs unless you turn on a share link, and you can turn it off at any time. There are no ads or trackers.",
  },
  {
    q: "Will my CV get through applicant tracking systems?",
    a: "The templates use real, selectable text in a logical reading order, which is what ATS software needs. For the strictest systems, choose the Classic ATS template.",
  },
  {
    q: "Can I edit on my phone?",
    a: "Yes. The editor works on small screens, and you can switch between the form and the preview with one tap.",
  },
];

export function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-fg">
      <Nav />
      <Hero />
      <Templates />
      <Features />
      <Steps />
      <Faq />
      <FinalCta />
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-fg-subtle sm:flex-row">
          <span className="inline-flex items-center gap-2">
            <ApexLogo size={18} className="h-[18px] w-[18px]" /> © {new Date().getFullYear()} ApexCV
          </span>
          <span className="inline-flex items-center gap-4">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-fg-secondary transition-colors hover:text-fg">
              <Github className="h-4 w-4" aria-hidden /> GitHub
            </a>
            <span>
            Made by{" "}
            <a href="https://pawiromitchel.com/" target="_blank" rel="noopener noreferrer" className="text-fg-secondary underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg">
              Mitchel
            </a>
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-canvas/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <ApexLogo size={28} className="h-7 w-7" />
          <span className="text-[15px] font-semibold tracking-tight">ApexCV</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-fg-muted md:flex" aria-label="Page sections">
          {[
            ["Templates", "#templates"],
            ["Features", "#features"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="rounded-lg px-3 py-2 transition-colors hover:bg-surface-2 hover:text-fg">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ApexCV on GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <Github className="h-[18px] w-[18px]" aria-hidden />
          </a>
          <ThemeToggle />
          <Link href="/app" className={buttonVariants({ variant: "primary" })}>
            Open app
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      {/* soft glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgb(var(--primary)/0.14),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[0.9fr_1.25fr] lg:pt-24">
        <div>
          <p style={{ animationDelay: "0ms" }} className="animate-hero-in inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[13px] text-fg-muted shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Free · No account · Print-ready PDF
          </p>
          <h1 style={{ animationDelay: "70ms" }} className="animate-hero-in mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            Write a CV you’re proud to send.
          </h1>
          <p style={{ animationDelay: "140ms" }} className="animate-hero-in mt-5 max-w-lg text-base leading-relaxed text-fg-muted sm:text-lg">
            A calm, guided editor with a live preview, honest checks before you send, and clean templates that read well to people and ATS alike.
          </p>
          <div style={{ animationDelay: "210ms" }} className="animate-hero-in mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/app?new=template" className={buttonVariants({ variant: "primary", size: "lg", className: "group" })}>
              Create your CV
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/app?new=import" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <FileUp className="h-4 w-4" /> Import an existing PDF
            </Link>
          </div>
          <p style={{ animationDelay: "280ms" }} className="animate-hero-in mt-4 text-[13px] text-fg-subtle">
            Takes about 15 minutes. Your work saves as you type.
          </p>
        </div>

        <div className="animate-hero-tilt-in">
          <HeroDemo />
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <motion.div variants={stagger(0.06)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="mx-auto mb-12 max-w-2xl text-center">
      <motion.p variants={fadeUp} className="text-[13px] font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </motion.p>
      <motion.h2 variants={fadeUp} className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </motion.h2>
      {body && (
        <motion.p variants={fadeUp} className="mt-3 text-fg-muted">
          {body}
        </motion.p>
      )}
    </motion.div>
  );
}

function Templates() {
  return (
    <section id="templates" className="scroll-mt-20 border-t border-line bg-surface/50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle eyebrow="Templates" title="Five layouts, one click apart" body="Switch templates any time. Your content stays put and reflows instantly." />
        <motion.div
          variants={stagger(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5"
        >
          {TEMPLATES.map((t) => (
            <motion.div key={t.id} variants={fadeUp} className="w-[62%] shrink-0 snap-center sm:w-auto">
              <div className="group relative overflow-hidden rounded-xl border border-line bg-surface shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-lifted">
                <TemplateThumbnail data={initialResumeData} templateId={t.id} aspect="page" className="border-b border-line" />
                <div className="px-3 py-2.5">
                  <Link
                    href="/app?new=template"
                    className="text-sm font-semibold outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-primary/60"
                  >
                    {t.name}
                  </Link>
                  <p className="truncate text-xs text-fg-muted">{t.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle eyebrow="Why ApexCV" title="Everything that matters, nothing that doesn’t" />
        <motion.div variants={stagger(0.06)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="group rounded-2xl border border-line bg-surface p-6 shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-lifted"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 [&>svg]:h-5 [&>svg]:w-5">
                {f.icon}
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{f.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section className="border-y border-line bg-surface/50 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionTitle eyebrow="How it works" title="From blank page to sent in three steps" />
        <motion.ol variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.li key={s.title} variants={fadeUp} className="relative text-center sm:text-left">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-fg shadow-lifted sm:mx-0">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-fg-muted">{s.body}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionTitle eyebrow="FAQ" title="Questions, answered" />
        <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
                >
                  {item.q}
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={spring.snappy} className="shrink-0 text-fg-subtle">
                    <Plus className="h-5 w-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-fg-muted">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 pb-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={spring.gentle}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 text-center shadow-lifted"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_100%,rgb(var(--primary)/0.14),transparent_70%)]" />
        <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">Your next role starts with a great CV.</h2>
        <p className="relative mt-3 text-fg-muted">Free, private, and ready to download in minutes.</p>
        <Link href="/app?new=template" className={buttonVariants({ variant: "primary", size: "lg", className: "relative mt-8" })}>
          Create your CV <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}
