"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  content: string;
  side?: "top" | "bottom";
}

export function InfoTooltip({ content, side = "top" }: Props) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-muted-foreground/30 text-[10px] font-bold leading-none text-muted-foreground/60 transition-colors hover:border-muted-foreground/60 hover:text-muted-foreground">
        ?
      </span>
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: side === "top" ? 6 : -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-56 rounded-xl border border-border bg-card px-3 py-2 text-xs leading-relaxed text-card-foreground shadow-elevated backdrop-blur-sm ${
              side === "top"
                ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
                : "top-full left-1/2 -translate-x-1/2 mt-2"
            }`}
          >
            {content}
            {/* Arrow */}
            <span
              className={`absolute left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-border bg-card ${
                side === "top"
                  ? "-bottom-1 border-r border-b"
                  : "-top-1 border-l border-t"
              }`}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
