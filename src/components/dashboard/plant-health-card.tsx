"use client";

import { motion } from "framer-motion";

export function PlantHealthCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group relative flex h-56 items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-emerald-500/5 to-teal-500/5 shadow-card transition-shadow duration-300 hover:shadow-elevated"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/3 h-32 w-32 rounded-full bg-emerald-500/8 blur-3xl" />

      {/* Pattern overlay — subtle crop rows */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 40px, rgba(22,163,74,0.5) 40px, rgba(22,163,74,0.5) 41px)`,
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-3 px-8 text-center">
        {/* Leaf SVG */}
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <svg
            className="h-7 w-7 text-primary"
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
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg font-bold tracking-tight text-card-foreground">
          CNN Plant Health Classifier
        </h3>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          TensorFlow Lite model processing crop imagery for disease detection
          and growth stage classification
        </p>

        {/* Status badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Phase 4 — In Development
        </span>
      </div>
    </motion.div>
  );
}
