"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckIcon, CloseIcon } from "@/components/site/Icons";

type ToastKind = "success" | "error";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<(kind: ToastKind, message: string) => void>(() => {});

/** Fire a toast from any admin client component. */
export function useToast() {
  return useContext(ToastContext);
}

// Deliberately hand-rolled rather than pulling in a toast library — the admin
// only needs a transient success/error line, and framer-motion is already a
// dependency for the rest of the panel.
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              role="status"
              className={`pointer-events-auto flex items-center gap-2.5 rounded-control border px-4 py-3 text-sm font-medium shadow-lg ${
                t.kind === "success"
                  ? "border-gold/40 bg-surface text-fg"
                  : "border-red-500/40 bg-surface text-red-500"
              }`}
            >
              <span className={t.kind === "success" ? "text-gold-dark" : "text-red-500"}>
                {t.kind === "success" ? <CheckIcon /> : <CloseIcon />}
              </span>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
