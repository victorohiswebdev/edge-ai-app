"use client";

import { motion } from "framer-motion";

export function PlantHealthCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5"
    >
      {/* Subtle decorative orbs */}
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-3 text-center">
        {/* Leaf icon */}
        <svg
          className="h-8 w-8 text-primary/60"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>

        {/* Gradient text */}
        <p className="text-sm font-semibold tracking-wide">
          <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-400 bg-clip-text text-transparent">
            CNN Inference Panel
          </span>
        </p>

        <p className="mx-auto max-w-[240px] text-xs text-muted-foreground">
          Plant health classification powered by TensorFlow Lite — processing
          crop imagery for disease detection
        </p>

        {/* Pulsing dot */}
        <span className="inline-flex items-center gap-2 text-[10px] font-medium text-muted-foreground/60">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary/60" />
          </span>
          Coming in Phase 4
        </span>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-emerald-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}
